from database import get_db_connection


def match_emergency_to_helpers(emergency_id, radius_km=1):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT
        e.id AS emergency_id,
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
        (LOWER(e.emergency_type) = 'medical'
            AND h.skill IN ('Doctor', 'First Aid'))

        OR

        (LOWER(e.emergency_type) = 'fire'
            AND h.skill = 'Firefighter')

        OR

        (LOWER(e.emergency_type) = 'electrical'
            AND h.skill = 'Electrician')

        OR

        (LOWER(e.emergency_type) = 'security'
            AND h.skill = 'Security')
    )

    HAVING distance_km <= %s

    ORDER BY distance_km ASC

    LIMIT 3
    """

    cursor.execute(query, (emergency_id, radius_km))

    helpers = cursor.fetchall()

    cursor.close()
    db.close()

    return helpers