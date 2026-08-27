import math
import re
from typing import Dict, Any, List, Tuple
from collections import Counter
from datetime import datetime, timezone

CATEGORIES_KEYWORDS = {
    "IT Support": [
        "wifi", "internet", "network", "portal", "login", "password", "server", "computer", "laptop",
        "printer", "software", "hardware", "bug", "crash", "email", "database", "screen", "lan", "system"
    ],
    "Infrastructure": [
        "fan", "light", "ac", "air conditioner", "electricity", "bench", "chair", "table", "door", "window",
        "water", "tap", "leakage", "elevator", "lift", "classroom", "board", "projector", "wall", "plumbing"
    ],
    "Hostel": [
        "room", "hostel", "warden", "mess", "bed", "mattress", "bathroom", "cleaning", "geyser", "curfew",
        "roommate", "block", "floor", "laundry", "drinking water", "hot water"
    ],
    "Transport": [
        "bus", "driver", "route", "van", "transport", "delay", "pickup", "drop", "schedule", "traffic",
        "conductor", "bus stop", "vehicle", "breakdown"
    ],
    "Academic": [
        "exam", "marks", "grades", "professor", "faculty", "attendance", "lecture", "timetable", "class",
        "assignment", "lab", "syllabus", "results", "transcript", "certificate"
    ],
    "Fees": [
        "fee", "payment", "receipt", "refund", "challan", "dues", "scholarship", "fine", "account",
        "transaction", "tuition", "bank", "invoice"
    ],
    "Library": [
        "book", "library", "librarian", "journal", "borrow", "return", "fine", "study room", "reading room",
        "catalog", "digital library"
    ],
    "Security": [
        "guard", "gate", "id card", "theft", "stolen", "lost", "camera", "cctv", "safety", "parking",
        "harassment", "emergency", "stranger"
    ],
    "Food": [
        "canteen", "cafeteria", "mess", "food", "hygiene", "taste", "price", "snack", "quality", "cleanliness",
        "cook", "meal", "breakfast", "lunch", "dinner"
    ],
    "Administration": [
        "id card", "notice", "office", "clerk", "staff", "delay", "document", "verification", "hall ticket",
        "permission", "leave", "application"
    ]
}

CRITICAL_KEYWORDS = [
    "fire", "electric shock", "danger", "hazard", "medical", "injury", "blood", "gas leak", "threat",
    "emergency", "urgent", "immediately", "severe", "life-threatening", "collapsed", "harassment"
]

HIGH_KEYWORDS = [
    "broken", "down", "stopped working", "cannot login", "exam tomorrow", "no water", "no power", "blackout",
    "failed", "stolen", "leakage", "deadline", "locked out", "unusable"
]

LOW_KEYWORDS = [
    "suggestion", "feedback", "slow", "minor", "spelling", "color", "request for info", "cosmetic", "enhancement"
]

NEGATIVE_SENTIMENT_WORDS = [
    "terrible", "worst", "horrible", "angry", "disgusted", "frustrated", "pathetic", "annoying",
    "useless", "disappointed", "bad", "poor", "unacceptable", "ridiculous", "hate", "slow", "broken"
]

POSITIVE_SENTIMENT_WORDS = [
    "good", "great", "thank", "pleased", "appreciated", "resolved", "helpful", "kind", "prompt", "smooth"
]

def tokenize(text: str) -> List[str]:
    text = text.lower()
    words = re.findall(r'\b[a-z]{2,}\b', text)
    return words

def compute_tf_idf_vector(tokens: List[str], all_words: set) -> Dict[str, float]:
    counts = Counter(tokens)
    total_tokens = len(tokens) if tokens else 1
    vector = {}
    for word in all_words:
        tf = counts.get(word, 0) / total_tokens
        vector[word] = tf
    return vector

def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    dot_product = sum(vec1[k] * vec2.get(k, 0.0) for k in vec1)
    mag1 = math.sqrt(sum(v * v for v in vec1.values()))
    mag2 = math.sqrt(sum(v * v for v in vec2.values()))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product / (mag1 * mag2)

class AIService:
    @staticmethod
    def classify_complaint(title: str, description: str) -> Dict[str, Any]:
        combined_text = f"{title} {description}".lower()
        tokens = tokenize(combined_text)
        
        # 1. Category Prediction
        category_scores = {}
        for category, keywords in CATEGORIES_KEYWORDS.items():
            score = 0
            for kw in keywords:
                if kw in combined_text:
                    score += 2 if f" {kw} " in f" {combined_text} " else 1
            category_scores[category] = score

        best_category = "General"
        max_score = 0
        total_category_score = sum(category_scores.values())
        
        if total_category_score > 0:
            best_cat, max_s = max(category_scores.items(), key=lambda x: x[1])
            if max_s > 0:
                best_category = best_cat
                max_score = max_s
                confidence = min(0.95, round(0.5 + (max_score / (total_category_score + 2)) * 0.45, 2))
            else:
                confidence = 0.60
        else:
            confidence = 0.50

        # 2. Priority Prediction
        priority = "medium"
        if any(w in combined_text for w in CRITICAL_KEYWORDS):
            priority = "critical"
        elif any(w in combined_text for w in HIGH_KEYWORDS):
            priority = "high"
        elif any(w in combined_text for w in LOW_KEYWORDS):
            priority = "low"

        # 3. Sentiment Analysis
        neg_count = sum(1 for w in NEGATIVE_SENTIMENT_WORDS if w in combined_text)
        pos_count = sum(1 for w in POSITIVE_SENTIMENT_WORDS if w in combined_text)
        
        if neg_count > 2 or priority == "critical":
            sentiment = "negative"
        elif neg_count > 0:
            sentiment = "slightly_negative"
        elif pos_count > 0:
            sentiment = "positive"
        else:
            sentiment = "neutral"

        return {
            "ai_category": best_category,
            "ai_priority": priority,
            "ai_sentiment": sentiment,
            "ai_confidence": confidence
        }

    @staticmethod
    def check_duplicate_complaints(db, new_title: str, new_desc: str, threshold: float = 0.65) -> Tuple[float, List[str]]:
        try:
            new_text = f"{new_title} {new_desc}"
            new_tokens = tokenize(new_text)
            if not new_tokens:
                return 0.0, []

            # Fetch recent complaints (up to last 150)
            recent_complaints = list(db.complaints.find(
                {"status": {"$nin": ["closed", "rejected"]}},
                {"_id": 1, "complaint_number": 1, "title": 1, "description": 1}
            ).sort("created_at", -1).limit(150))

            if not recent_complaints:
                return 0.0, []

            max_sim = 0.0
            duplicates = []

            for comp in recent_complaints:
                comp_text = f"{comp.get('title', '')} {comp.get('description', '')}"
                comp_tokens = tokenize(comp_text)
                if not comp_tokens:
                    continue

                vocab = set(new_tokens).union(set(comp_tokens))
                v1 = compute_tf_idf_vector(new_tokens, vocab)
                v2 = compute_tf_idf_vector(comp_tokens, vocab)
                sim = cosine_similarity(v1, v2)

                if sim > max_sim:
                    max_sim = sim
                if sim >= threshold:
                    duplicates.append(str(comp["_id"]))

            return round(max_sim, 2), duplicates
        except Exception as e:
            return 0.0, []

    @staticmethod
    def generate_ai_insights(db) -> Dict[str, Any]:
        total_complaints = db.complaints.count_documents({})
        if total_complaints == 0:
            return {
                "insights": ["System is initialized. Waiting for complaints data to generate trend intelligence."],
                "high_risk_complaints": [],
                "potential_duplicates": [],
                "emerging_categories": []
            }

        insights = []

        # 1. Critical & SLA at risk
        critical_count = db.complaints.count_documents({"priority": "critical", "status": {"$in": ["submitted", "in_progress", "under_review", "assigned"]}})
        if critical_count > 0:
            insights.append(f"⚠️ {critical_count} critical issues require immediate administrator intervention.")

        # 2. SLA Breaches
        breached_count = db.complaints.count_documents({"sla_status": "breached", "status": {"$nin": ["closed", "resolved"]}})
        if breached_count > 0:
            insights.append(f"🚨 {breached_count} active complaints have breached their SLA resolution target.")

        # 3. Category with highest volume
        cat_pipeline = [
            {"$group": {"_id": "$ai_category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]
        top_cat = list(db.complaints.aggregate(cat_pipeline))
        if top_cat and top_cat[0]["_id"]:
            insights.append(f"📈 '{top_cat[0]['_id']}' is the most active category accounting for {top_cat[0]['count']} reported issues.")

        # 4. Sentiment observation
        neg_sentiment_count = db.complaints.count_documents({"ai_sentiment": {"$in": ["negative", "slightly_negative"]}})
        sentiment_ratio = round((neg_sentiment_count / total_complaints) * 100, 1)
        insights.append(f"💬 {sentiment_ratio}% of submitted complaints exhibit frustrated or urgent user sentiment.")

        # High risk complaints
        high_risk = list(db.complaints.find(
            {"$or": [{"priority": "critical"}, {"sla_status": "breached"}]},
            {"_id": 1, "complaint_number": 1, "title": 1, "priority": 1, "status": 1, "sla_status": 1, "created_at": 1}
        ).sort("created_at", -1).limit(5))

        for h in high_risk:
            h["id"] = str(h["_id"])
            if isinstance(h.get("created_at"), datetime):
                h["created_at"] = h["created_at"].isoformat()

        # Potential duplicates list
        potential_dupes = list(db.complaints.find(
            {"duplicate_score": {"$gte": 0.65}},
            {"_id": 1, "complaint_number": 1, "title": 1, "duplicate_score": 1, "status": 1}
        ).sort("duplicate_score", -1).limit(5))

        for d in potential_dupes:
            d["id"] = str(d["_id"])

        # Emerging categories
        emerging = list(db.complaints.aggregate([
            {"$group": {"_id": "$category_name", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]))

        emerging_cats = [{"category": e["_id"] or "Unassigned", "count": e["count"]} for e in emerging]

        return {
            "insights": insights,
            "high_risk_complaints": high_risk,
            "potential_duplicates": potential_dupes,
            "emerging_categories": emerging_cats
        }

ai_service = AIService()
