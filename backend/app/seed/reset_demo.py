import argparse
import asyncio
from app.core.database import init_db
from app.seed.synthetic.generator import SyntheticDataGenerator

async def main():
    parser = argparse.ArgumentParser(description="Reset Gullak AI demo environment to a specific state.")
    parser.add_argument("--state", type=str, default="before", choices=["before", "mid", "after"],
                        help="Demo state: 'before' (pending approval), 'mid' (executing), 'after' (outcomes measured)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed (default 42)")
    args = parser.parse_args()

    await init_db()
    gen = SyntheticDataGenerator(seed=args.seed, merchant_count=12)
    await gen.generate_all(state=args.state)
    print(f"\n[DEMO RESET] Gullak AI environment reset to '{args.state}' state!")

if __name__ == "__main__":
    asyncio.run(main())
