import argparse
import asyncio
from app.core.database import init_db
from app.seed.synthetic.generator import SyntheticDataGenerator

async def main():
    parser = argparse.ArgumentParser(description="Generate deterministic synthetic data for Gullak AI.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--merchants", type=int, default=12, help="Number of synthetic merchants to generate (max 12)")
    parser.add_argument("--state", type=str, default="before", choices=["before", "mid", "after"], help="Demo state (before, mid, after)")
    args = parser.parse_args()

    await init_db()
    gen = SyntheticDataGenerator(seed=args.seed, merchant_count=args.merchants)
    await gen.generate_all(state=args.state)
    print(f"\n[SUCCESS] Synthetic data generated successfully with seed={args.seed}, merchants={args.merchants}, state={args.state}!")

if __name__ == "__main__":
    asyncio.run(main())
