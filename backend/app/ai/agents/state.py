from typing import TypedDict, List, Dict, Any, Optional

class GullakAgentState(TypedDict):
    merchant_id: str
    query: str
    intent: str
    language: str # hi, mr, en, hinglish
    conversation_id: str
    agent_name: str
    
    # Context data extracted by tools
    sales_context: Optional[Dict[str, Any]]
    inventory_context: Optional[Dict[str, Any]]
    customer_context: Optional[Dict[str, Any]]
    
    # Decisions & Actions
    suggested_action: Optional[str]
    why_explanation: Optional[str]
    approval_required: bool
    approval_id: Optional[str]
    execution_data: Optional[Dict[str, Any]]
    
    # Final Output
    response_text: str
    audio_base64: Optional[str]
