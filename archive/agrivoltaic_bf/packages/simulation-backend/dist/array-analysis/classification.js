function dominantHorizontalDirection(axis) {
    return Math.abs(axis.x) >= Math.abs(axis.y) ? "x" : "y";
}
export function edgeLabelsForAxis(axis) {
    if (dominantHorizontalDirection(axis) === "y") {
        return axis.y >= 0
            ? { negative: "edge_south", positive: "edge_north" }
            : { negative: "edge_north", positive: "edge_south" };
    }
    return axis.x >= 0
        ? { negative: "edge_west", positive: "edge_east" }
        : { negative: "edge_east", positive: "edge_west" };
}
export function classifyRowPairEdge(rowPairIndex, rowPairCount, crossAxis) {
    const labels = edgeLabelsForAxis(crossAxis);
    const classifications = [];
    if (rowPairCount <= 1) {
        classifications.push(labels.negative, labels.positive);
        return classifications;
    }
    if (rowPairIndex === 0)
        classifications.push(labels.negative);
    if (rowPairIndex === rowPairCount - 1)
        classifications.push(labels.positive);
    if (classifications.length === 0)
        classifications.push("interior");
    return classifications;
}
export function classifyBayEdge(bayIndex, bayCount, rowAxis) {
    const labels = edgeLabelsForAxis(rowAxis);
    const classifications = [];
    if (bayCount <= 1) {
        classifications.push(labels.negative, labels.positive, "end_of_row");
        return classifications;
    }
    if (bayIndex === 0)
        classifications.push(labels.negative, "end_of_row");
    if (bayIndex === bayCount - 1)
        classifications.push(labels.positive, "end_of_row");
    return classifications;
}
export function mergeGridClassifications(rowPairEdgeLabels, bayEdgeLabels) {
    const merged = new Set([
        ...rowPairEdgeLabels,
        ...bayEdgeLabels,
    ]);
    const hasRowEdge = rowPairEdgeLabels.length > 0;
    const hasBayEdge = bayEdgeLabels.some((entry) => entry === "end_of_row" || entry.startsWith("edge_"));
    if (hasRowEdge && hasBayEdge) {
        merged.add("corner");
    }
    if (merged.size === 0) {
        merged.add("interior");
    }
    return [...merged];
}
