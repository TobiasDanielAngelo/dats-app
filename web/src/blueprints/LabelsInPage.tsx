import React from "react";

type Size = [number, number];

interface LabelsInPageProps {
  labelSize: Size; // [width, height] in mm
  pageSize: Size; // [width, height] in mm
  allLabels: React.ReactNode[];
  pageRef: React.RefObject<HTMLDivElement | null>;
}

const LabelsInPage: React.FC<LabelsInPageProps> = ({
  labelSize,
  pageSize,
  allLabels,
  pageRef,
}) => {
  const [lw, lh] = labelSize;
  const [pw, ph] = pageSize;

  // --- Compute best fit ---
  const fitUprightCols = Math.floor(pw / lw);
  const fitUprightRows = Math.floor(ph / lh);
  const uprightCount = fitUprightCols * fitUprightRows;

  const fitRotCols = Math.floor(pw / lh);
  const fitRotRows = Math.floor(ph / lw);
  const rotatedCount = fitRotCols * fitRotRows;

  // Hybrid horizontal strip (right side)
  const leftoverW = pw - fitUprightCols * lw;
  let hybridHCount = 0;
  if (leftoverW >= lh) {
    const extraCols = Math.floor(leftoverW / lh);
    const extraRows = Math.floor(ph / lw);
    hybridHCount = uprightCount + extraCols * extraRows;
  }

  // Hybrid vertical strip (bottom)
  const leftoverH = ph - fitUprightRows * lh;
  let hybridVCount = 0;
  if (leftoverH >= lw) {
    const extraRows = Math.floor(leftoverH / lw);
    const extraCols = Math.floor(pw / lh);
    hybridVCount = uprightCount + extraCols * extraRows;
  }

  // Pick best
  const best = [
    { type: "upright", count: uprightCount },
    { type: "rotated", count: rotatedCount },
    { type: "hybridH", count: hybridHCount },
    { type: "hybridV", count: hybridVCount },
  ].reduce((a, b) => (b.count > a.count ? b : a));

  // --- Render labels ---
  const labels: React.ReactNode[] = [];

  let count = 0;

  if (
    best.type === "upright" ||
    best.type === "hybridH" ||
    best.type === "hybridV"
  ) {
    for (let r = 0; r < fitUprightRows; r++) {
      for (let c = 0; c < fitUprightCols; c++) {
        labels.push(
          <div
            key={`U-${r}-${c}`}
            style={{
              position: "absolute",
              width: `${lw}mm`,
              height: `${lh}mm`,
              left: `${c * lw}mm`,
              top: `${r * lh}mm`,
              border: "0.1mm solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {allLabels[count]}
          </div>
        );
        count++;
      }
    }
  } else if (best.type === "rotated") {
    for (let r = 0; r < fitRotRows; r++) {
      for (let c = 0; c < fitRotCols; c++) {
        labels.push(
          <div
            key={`R-${r}-${c}`}
            style={{
              position: "absolute",
              width: `${lh}mm`,
              height: `${lw}mm`,
              left: `${c * lh}mm`,
              top: `${r * lw}mm`,
              border: "0.1mm solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: "center",
            }}
          >
            <div
              style={{
                transform: "rotate(90deg)",
              }}
            >
              {allLabels[count]}
            </div>
          </div>
        );
        count++;
      }
    }
  } else if (best.type === "hybridH") {
    const usedW = fitUprightCols * lw;
    const extraCols = Math.floor(leftoverW / lh);
    const extraRows = Math.floor(ph / lw);
    for (let r = 0; r < extraRows; r++) {
      for (let c = 0; c < extraCols; c++) {
        labels.push(
          <div
            key={`HR-${r}-${c}`}
            style={{
              position: "absolute",
              width: `${lh}mm`,
              height: `${lw}mm`,
              left: `${usedW + c * lh}mm`,
              top: `${r * lw}mm`,
              border: "0.1mm solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: "center",
            }}
          >
            <div
              style={{
                transform: "rotate(90deg)",
              }}
            >
              {allLabels[count]}
            </div>
          </div>
        );
        count++;
      }
    }
  } else if (best.type === "hybridV") {
    const usedH = fitUprightRows * lh;
    const extraRows = Math.floor(leftoverH / lw);
    const extraCols = Math.floor(pw / lh);
    for (let r = 0; r < extraRows; r++) {
      for (let c = 0; c < extraCols; c++) {
        labels.push(
          <div
            key={`VR-${r}-${c}`}
            style={{
              position: "absolute",
              width: `${lh}mm`,
              height: `${lw}mm`,
              left: `${c * lh}mm`,
              top: `${usedH + r * lw}mm`,
              border: "0.1mm solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(90deg)",
              transformOrigin: "center",
            }}
          >
            {allLabels[count]}
          </div>
        );
        count++;
      }
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: `${pw}mm`,
        height: `${ph}mm`,
        background: "white",
        border: "0.2mm solid black",
      }}
      ref={pageRef}
    >
      <style type="text/css" media="print">
        {"@page { size: A4 portrait; margin: 10mm; }"}
      </style>
      <div style={{ position: "absolute" }}>{labels}</div>
    </div>
  );
};

export default LabelsInPage;
