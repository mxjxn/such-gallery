import { ethers } from "ethers";


export default function handleEthValue(value: string): string {
    const etherValue = ethers.utils.formatEther(value);
    const numberValue = Number(etherValue);
    if (numberValue < 0.0001) {
        // Return full precision
        return String(etherValue);
    }
    return String(parseFloat(numberValue.toPrecision(4)));
}
/*
export default function handleEthValue(value: string): number {
  return parseFloat(Number(ethers.utils.formatEther(value)).toPrecision(4));
}
*/

export function isERC20(val:string):boolean {
	return Number(val) > 0;
}
