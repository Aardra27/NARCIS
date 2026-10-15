def calculate_priority(
    quantity_category,
    previous_ndps_firs,
    total_criminal_cases,
    previous_seizure_link,
    interstate_travel,
    intelligence_input
):
    """
    Calculate synthetic investigation priority.

    This scoring function is for the research-informed synthetic
    dataset only. It is not a real-world law-enforcement risk score.
    """

    score = 0

    # Quantity category
    if quantity_category == "Commercial":
        score += 35
    elif quantity_category == "Intermediate":
        score += 18
    elif quantity_category == "Small":
        score += 5
    elif quantity_category == "Not Applicable":
        # Used for controlled precursor chemicals such as
        # Pseudoephedrine where small/commercial thresholds
        # are not applicable.
        score += 0

    # Previous NDPS FIRs
    score += previous_ndps_firs * 12

    # Previous criminal cases
    score += min(
        total_criminal_cases * 2,
        10
    )

    # Previous seizure linkage
    if previous_seizure_link == "Yes":
        score += 10

    # Interstate travel
    if interstate_travel == "Yes":
        score += 10

    # Intelligence input
    if intelligence_input != "No Intelligence":
        score += 8

    # Final priority
    if score >= 60:
        return "High"

    elif score >= 30:
        return "Medium"

    else:
        return "Low"


if __name__ == "__main__":
    result = calculate_priority(
        "Commercial",
        1,
        2,
        "Yes",
        "Yes",
        "NCB Intelligence"
    )

    print("Test Priority:", result)
