import numpy as np
from typing import List, Dict, Any, Optional

class MerchantScopedVectorStore:
    """In-memory & pgvector compatible RAG vector store with strict merchant-level metadata filtering."""
    _documents: List[Dict[str, Any]] = []

    @classmethod
    def seed_merchant_knowledge(cls, merchant_id: str):
        """Seeds merchant policies and store knowledge."""
        docs = [
            {
                "id": f"{merchant_id}-doc-1",
                "merchant_id": merchant_id,
                "title": "Diwali Store Operations Policy",
                "content": "Store remains open 8 AM to 11 PM during Diwali week. Preferred distributor for dairy is Mahalaxmi Wholesale with 48h lead time.",
                "category": "STORE_POLICY",
                # 8-dimensional normalized sample embedding
                "embedding": [0.12, 0.45, 0.88, 0.11, 0.05, 0.32, 0.65, 0.42]
            },
            {
                "id": f"{merchant_id}-doc-2",
                "merchant_id": merchant_id,
                "title": "Customer Credit & Khata Terms",
                "content": "Maximum credit limit per customer is ₹2,000 for verified residents. Settled weekly via UPI or Soundbox QR.",
                "category": "CREDIT_POLICY",
                "embedding": [0.35, 0.12, 0.45, 0.78, 0.22, 0.54, 0.12, 0.66]
            },
            {
                "id": f"{merchant_id}-doc-3",
                "merchant_id": merchant_id,
                "title": "Paytm Soundbox Daily Settlement Schedule",
                "content": "All UPI and Soundbox QR payments are auto-settled every morning at 06:00 AM into primary bank account without deductions.",
                "category": "PAYMENT_INFO",
                "embedding": [0.82, 0.23, 0.15, 0.44, 0.61, 0.19, 0.45, 0.33]
            }
        ]
        cls._documents.extend(docs)

    @classmethod
    def search(
        cls,
        merchant_id: str,
        query_embedding: List[float],
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """Strictly searches ONLY documents belonging to the authenticated merchant."""
        scoped_docs = [d for d in cls._documents if d.get("merchant_id") == merchant_id]
        if not scoped_docs:
            cls.seed_merchant_knowledge(merchant_id)
            scoped_docs = [d for d in cls._documents if d.get("merchant_id") == merchant_id]

        q = np.array(query_embedding)
        norm_q = np.linalg.norm(q)
        if norm_q == 0:
            return scoped_docs[:top_k]

        scored = []
        for doc in scoped_docs:
            v = np.array(doc["embedding"])
            norm_v = np.linalg.norm(v)
            cosine = float(np.dot(q, v) / (norm_q * norm_v)) if norm_v > 0 else 0.0
            scored.append((cosine, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored[:top_k]]
