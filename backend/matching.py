from backend.database import get_db_connection


def match_emergency_to_helpers(emergency_id, radius_km=1):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    # Get emergency type and required skill
    cursor.execute(
        """
        SELECT emergency_type, required_skill
        FROM emergencies
        WHERE id = %s
        """,
        (emergency_id,)
    )

    emergency = cursor.fetchone()

    if not emergency:
        cursor.close()
        db.close()
        return []

    emergency_type = (emergency["emergency_type"] or "").lower()
    required_skill = (emergency["required_skill"] or "").lower()

    query = """
    SELECT
        e.id AS emergency_id,
        e.required_skill,
        h.id AS helper_id,
        h.name,
        h.phone,
        h.skill,
        h.latitude,
        h.longitude,

        6371 * 2 * ASIN(
            SQRT(
                POWER(
                    SIN(RADIANS(h.latitude - e.latitude) / 2),
                    2
                )
                +
                COS(RADIANS(e.latitude))
                * COS(RADIANS(h.latitude))
                * POWER(
                    SIN(RADIANS(h.longitude - e.longitude) / 2),
                    2
                )
            )
        ) AS distance_km

    FROM emergencies e
    CROSS JOIN helpers h

    WHERE e.id = %s

    AND h.available = TRUE
    AND h.verified = TRUE

    AND h.latitude IS NOT NULL
    AND h.longitude IS NOT NULL
    AND e.latitude IS NOT NULL
    AND e.longitude IS NOT NULL

    AND (
        (
            LOWER(e.required_skill) = 'first_aid'
            AND LOWER(h.skill) IN ('first aid', 'doctor')
        )

        OR

        (
            LOWER(e.required_skill) IN ('fire_responder', 'fire_response')
            AND LOWER(h.skill) IN ('firefighter', 'fire responder')
        )

        OR

        (
            LOWER(e.required_skill) = 'electrician'
            AND LOWER(h.skill) = 'electrician'
        )

        OR

        (
            LOWER(e.required_skill) = 'security'
            AND LOWER(h.skill) = 'security'
        )
    )

    HAVING distance_km <= %s

    ORDER BY distance_km ASC
    """

    cursor.execute(query, (emergency_id, radius_km))

    helpers = cursor.fetchall()

    cursor.close()
    db.close()

    # Fire and Missing/Vulnerable:
    # return ALL suitable responders.
    #
    # Normal emergencies:
    # return only the closest 3.
    if emergency_type not in ("fire", "danger"):
        helpers = helpers[:3]

    return helpers


def progressively_match_emergency(emergency_id):
    radii = [0.15, 0.30, 0.50, 1.0]

    for radius in radii:
        helpers = match_emergency_to_helpers(emergency_id, radius)

        if helpers:
            return helpers

    return []
