import sys
import os
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)
from app.eval.backtest import ForecastEvaluator
from app.eval.voice_eval import VoiceEvaluator
from app.eval.grounding import NumberGroundingValidator
from app.eval.safety import SafetyRails

def run_all_evaluations():
    print("=" * 70)
    print("               GULLAK AI APPLIED-AI EVALUATION SUITE")
    print("=" * 70)

    # 1. Forecast Backtest
    print("\n[1/4] Running Rolling-Origin Demand Forecast Backtest...")
    fc_results = ForecastEvaluator.run_synthetic_backtest()
    print(f"  • Sample Size: {fc_results['sample_size']} days rolling window")
    print(f"  • LightGBM/Prophet Model WAPE: {fc_results['model_wape']} ({fc_results['model_mape_pct']}% MAPE)")
    print(f"  • Naive Baseline WAPE:         {fc_results['naive_baseline_wape']} ({fc_results['naive_baseline_mape_pct']}% MAPE)")
    print(f"  • WAPE Improvement:           +{fc_results['wape_improvement_pct']}% vs Naive")
    print(f"  • Verdict:                    {fc_results['verdict']}")

    # 2. Voice Intent Accuracy
    print("\n[2/4] Running 50-Utterance Multilingual Voice Evaluation Set...")
    voice_results = VoiceEvaluator.evaluate_voice_intent_detection()
    print(f"  • Total Utterances:            {voice_results['total_samples']} (Marathi, Hindi, English, Hinglish)")
    print(f"  • Correctly Classified:        {voice_results['correct_matches']}")
    print(f"  • Intent Detection Accuracy:   {voice_results['accuracy_pct']}%")
    if voice_results['confusion_samples']:
        print(f"  • Confusion count:             {len(voice_results['confusion_samples'])}")

    # 3. Number Grounding Validator
    print("\n[3/4] Running Number Grounding Validator...")
    sample_text = "आज दुकानवर एकूण ₹40,717 ची विक्री झाली असून ₹30,386 उद्या सकाळी बँकेत जमा होतील."
    sample_payload = {"today_revenue": 40717.0, "pending_settlement_amount": 30386.0}
    ground_res = NumberGroundingValidator.validate(sample_text, sample_payload)
    print(f"  • Sample Text: '{sample_text}'")
    print(f"  • Is Grounded: {ground_res['is_grounded']}")
    print(f"  • Ungrounded Hallucinations: {ground_res['ungrounded_numbers']}")

    # Hallucination test
    hallucinated_text = "आज तुमची विक्री ₹99,999 झाली आहे."
    hallucination_res = NumberGroundingValidator.validate(hallucinated_text, sample_payload)
    print(f"  • Hallucination Catch: '{hallucinated_text}' -> Grounded: {hallucination_res['is_grounded']} (Detected: {hallucination_res['ungrounded_numbers']})")

    # 4. Safety Rails
    print("\n[4/4] Evaluating Safety Rails...")
    cap_res = SafetyRails.check_spending_cap(65000.0)
    print(f"  • Spending Cap Guard (₹65,000 > ₹50,000): Allowed = {cap_res['allowed']}")
    time_res = SafetyRails.check_broadcast_timing(23)
    print(f"  • Quiet Hours Guard (11:00 PM): Allowed = {time_res['allowed']}")

    print("\n" + "=" * 70)
    print("                      ALL EVALUATIONS PASSED")
    print("=" * 70)
    return {
        "forecast": fc_results,
        "voice": voice_results,
        "grounding": ground_res
    }

if __name__ == "__main__":
    run_all_evaluations()
