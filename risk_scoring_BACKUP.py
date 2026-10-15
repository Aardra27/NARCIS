def calculate_priority(
    quantity_category,
    previous_ndps_firs,
    total_criminal_cases,
    previous_seizure_link,
    interstate_travel,
    intelligence_input
):
    """
    Research-informed rule-based scoring for Investigation Priority.
    """

    score = 0

    # Quantity (highest importance)
    if quantity_category == "Commercial":
        score += 35
    elif quantity_category == "Intermediate":
        score += 18
    else:
        score += 5

    # Previous NDPS FIRs
    score += previous_ndps_firs * 12

    # Other criminal history (capped)
    score += min(total_criminal_cases * 2, 10)

    # Previous seizure linkage
    if previous_seizure_link == "Yes":
        score += 10

    # Interstate trafficking
    if interstate_travel == "Yes":
        score += 10

    # Intelligence input
    if intelligence_input != "No Intelligence":
        score += 8

    # Final Priority
    if score >= 60:
        return "High"
    elif score >= 30:
        return "Medium"
    else:
        return "Low"


if __name__ == "__main__":

    priority = calculate_priority(
        quantity_category="Commercial",
        previous_ndps_firs=2,
        total_criminal_cases=4,
        previous_seizure_link="Yes",
        interstate_travel="Yes",
        intelligence_input="NCB Intelligence"
    )

    print(priority)