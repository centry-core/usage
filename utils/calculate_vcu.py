def calculate_vcu(cpu: int, memory: int, duration: int) -> int:
    duration_in_hours = duration / 3600
    return round((cpu + memory) * duration_in_hours, 2)


def calculate_extras(vcu: float) -> int:
    return round(vcu * 0.1, 2)
