export function* entries<K extends string | number | symbol, V>(object: {
    [key in K]: V
}) {
    for (const key in object) yield [key as K, object[key] as V] as [K, V];
}

export function asMap<K extends string | number | symbol, V>(object: Record<K, V>) {
    return new Map(entries(object));
}
