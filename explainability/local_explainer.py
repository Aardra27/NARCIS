import shap
import joblib
import numpy as np
import pandas as pd

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "saved_models" / "random_forest.pkl"
PLOT_DIR = BASE_DIR / "output" / "plots"
PLOT_DIR.mkdir(parents=True, exist_ok=True)


class LocalSHAPExplainer:

    def __init__(self):

        self.model = joblib.load(MODEL_PATH)
        self.explainer = shap.TreeExplainer(self.model)

    def _normalize_shap_values(self, shap_values, prediction_index=None):
        values = np.asarray(shap_values)

        if values.ndim == 3:
            if prediction_index is None:
                prediction_index = 0
            return values[0, :, prediction_index]

        if values.ndim == 2:
            return values[0]

        return values

    def _save_local_shap_plot(self, input_dataframe, shap_values, prediction_index=None, output_name=None):
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        row = input_dataframe.iloc[0]
        values = self._normalize_shap_values(shap_values, prediction_index)

        if prediction_index is None:
            prediction_index = int(self.model.predict(input_dataframe)[0])

        expected_value = self.explainer.expected_value
        if isinstance(expected_value, (list, tuple, np.ndarray)):
            base_value = expected_value[prediction_index]
        else:
            base_value = expected_value

        explanation = shap.Explanation(
            values=values,
            base_values=base_value,
            data=row.to_numpy(),
            feature_names=input_dataframe.columns.tolist(),
        )

        plot_name = output_name or f"local_shap_case_{prediction_index}.png"
        plot_path = PLOT_DIR / plot_name

        shap.plots.waterfall(explanation[0], max_display=10, show=False)
        plt.tight_layout()
        plt.savefig(plot_path, dpi=300, bbox_inches="tight")
        plt.close()

        return str(plot_path)

    def explain(self, input_dataframe, output_name=None):

        prediction = self.model.predict(input_dataframe)[0]
        probabilities = self.model.predict_proba(input_dataframe)[0]
        shap_values = self.explainer.shap_values(input_dataframe)

        prediction_index = int(prediction)
        plot_path = self._save_local_shap_plot(
            input_dataframe,
            shap_values,
            prediction_index=prediction_index,
            output_name=output_name,
        )

        return {
            "prediction": prediction,
            "probabilities": probabilities,
            "shap_values": shap_values,
            "expected_value": self.explainer.expected_value,
            "local_shap_png": plot_path,
        }


if __name__ == "__main__":

    print("Local SHAP Explainer Ready.")
