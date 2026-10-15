import matplotlib.pyplot as plt
import shap
from pathlib import Path

OUTPUT_DIR = Path("output/plots")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class SHAPVisualizer:

    @staticmethod
    def waterfall(explanation, filename="local_waterfall.png"):

        plt.figure(figsize=(10, 6))
        shap.plots.waterfall(explanation, show=False)

        save_path = OUTPUT_DIR / filename
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
        plt.close()

        return str(save_path)


    @staticmethod
    def force(explanation, filename="local_force.html"):

        save_path = OUTPUT_DIR / filename

        shap.save_html(
            str(save_path),
            shap.plots.force(explanation, matplotlib=False)
        )

        return str(save_path)


    @staticmethod
    def bar(explanation, filename="local_bar.png"):

        plt.figure(figsize=(10, 6))
        shap.plots.bar(explanation, show=False)

        save_path = OUTPUT_DIR / filename
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
        plt.close()

        return str(save_path)


if __name__ == "__main__":

    print("SHAP Visualization Module Ready.")
