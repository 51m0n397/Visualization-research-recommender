function arrayIntersection(a, b) {
    return a.filter(Set.prototype.has, new Set(b))
}

function padLinear([x0, x1], k) {
    const dx = (x1 - x0) * k / 2;
    return [+x0 - dx, +x1 + dx];
}

export { arrayIntersection, padLinear }