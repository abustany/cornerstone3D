import { Types } from '@cornerstonejs/core';
import { WADORSMetaData, WADORSMetaDataElement } from '../../../types';
import getNumberValues from './getNumberValues';
import getSequenceItems from './getSequenceItems';

function decodeBase64(base64String: string): ArrayBuffer {
    const binaryString = atob(base64String);
    const buffer = new ArrayBuffer(binaryString.length);
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return buffer;
}

function getLUT(pixelRepresentation: number, md: WADORSMetaData): Types.LutType {
  let [numLUTEntries, firstValueMapped, numBitsPerEntry] = getNumberValues(md["00283002"], 3)

  if (numLUTEntries === 0) {
    numLUTEntries = 65535;
  }

  const dataElement = md["00283006"] as unknown as ({vr: string, InlineBinary: string} | undefined)
  if (dataElement?.vr !== "OW" || !("InlineBinary" in dataElement)) {
    throw new Error("invalid LUT data element")
  }

  const arrayClass = pixelRepresentation === 0 ? Uint16Array : Int16Array
  const lutData = new arrayClass(decodeBase64(dataElement.InlineBinary))
  if (lutData.length !== numLUTEntries) throw new Error(`expected ${numLUTEntries} LUT entries, got ${lutData.length})`)

  const lut = {
    id: '1',
    firstValueMapped,
    numBitsPerEntry,
    lut: [],
  };

  for (let i = 0; i < numLUTEntries; i++) {
    lut.lut[i] = lutData[i]
  }

  return lut
}

function getLUTs(pixelRepresentation: number, lutSequence: WADORSMetaDataElement): Types.LutType[] {
  return getSequenceItems(lutSequence).map(item => getLUT(pixelRepresentation, item as unknown as WADORSMetaData))
}

export default getLUTs;
