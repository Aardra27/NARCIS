import numpy as np


class ExplanationGenerator:

    @staticmethod
    def generate(feature_names, feature_values, shap_values, top_n=5):

        shap_values = np.array(shap_values)

        importance = np.abs(shap_values)

        ranked = np.argsort(importance)[::-1]

        explanation = []

        for idx in ranked[:top_n]:

            contribution = "increased" if shap_values[idx] > 0 else "decreased"

            explanation.append({
                "feature": feature_names[idx],
                "value": feature_values[idx],
                "impact": float(round(shap_values[idx], 4)),
                "effect": contribution
            })

        return explanation


    @staticmethod
    def generate_text(prediction, explanation):

        lines = []

        lines.append(
            f"The model predicted '{prediction}' primarily because:"
        )

        for item in explanation:

            lines.append(
                f"- {item['feature']} = {item['value']} "
                f"{item['effect']} the prediction "
                f"(SHAP Impact: {item['impact']:+.4f})"
            )

        return "\n".join(lines)


if __name__ == "__main__":

    print("Explanation Generator Ready.")
