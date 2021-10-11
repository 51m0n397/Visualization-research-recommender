function arrayIntersection(a, b) {
    return a.filter(Set.prototype.has, new Set(b))
}

export { arrayIntersection }