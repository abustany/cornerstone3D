/* eslint no-bitwise: 0 */

import getNumberValue from "./getNumberValue";
import getValue from "./getValue";
import {WADORSMetaData} from "../../../types";
import getSequenceItems from "./getSequenceItems";

function getMinStoredPixelValue(md: WADORSMetaData) {
  const pixelRepresentation = getNumberValue(md['00280103']);

  if (pixelRepresentation === 0) {
    return 0;
  }

  const bitsStored = getNumberValue(md['00280101']);

  return -1 << (bitsStored - 1);
}

// 0 = unsigned / US, 1 = signed / SS
function getModalityLUTOutputPixelRepresentation(md: WADORSMetaData) {
  // CT SOP Classes are always signed
  const sopClassUID = getValue<string>(md['00080016']);

  if (
    sopClassUID === '1.2.840.10008.5.1.4.1.1.2' ||
    sopClassUID === '1.2.840.10008.5.1.4.1.1.2.1'
  ) {
    return 1;
  }

  // if rescale intercept and rescale slope are present, pass the minimum stored
  // pixel value through them to see if we get a signed output range
  const rescaleIntercept = getNumberValue(md['00281052']);
  const rescaleSlope = getNumberValue(md['00281053']);

  if (rescaleIntercept !== undefined && rescaleSlope !== undefined) {
    const minStoredPixelValue = getMinStoredPixelValue(md); //
    const minModalityLutValue =
      minStoredPixelValue * rescaleSlope + rescaleIntercept;

    if (minModalityLutValue < 0) {
      return 1;
    }

    return 0;
  }

  // Output of non linear modality lut is always unsigned
  if (getSequenceItems(md['00283000']).length > 0) {
    return 0;
  }

  // If no modality lut transform, output is same as pixel representation
  return getNumberValue(md['00280103']);
}

export default getModalityLUTOutputPixelRepresentation;
