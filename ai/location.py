import math


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the distance between two locations in kilometers.
    """

    earth_radius = 6371

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    difference_lat = math.radians(lat2 - lat1)
    difference_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(difference_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(difference_lon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return earth_radius * c


if __name__ == "__main__":

    # Example locations
    emergency_lat = 12.9716
    emergency_lon = 77.5946

    helper_lat = 12.9750
    helper_lon = 77.6000

    distance = calculate_distance(
        emergency_lat,
        emergency_lon,
        helper_lat,
        helper_lon
    )

    print("Emergency location:")
    print(emergency_lat, emergency_lon)

    print("\nHelper location:")
    print(helper_lat, helper_lon)

    print("\nDistance:", round(distance, 2), "km")