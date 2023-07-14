// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library ArrayUtils {
    function removeValue(uint32[] memory array, uint32 value) public pure returns (uint32[] memory) {
        uint32 count = 0;

        // 计算新数组的长度
        for (uint32 i = 0; i < array.length; i++) {
            if (array[i] != value) {
                count++;
            }
        }

        // 创建新的动态数组
        uint32[] memory newArray = new uint32[](count);
        uint32 index = 0;

        // 复制不等于目标值的元素到新数组中
        for (uint32 i = 0; i < array.length; i++) {
            if (array[i] != value) {
                newArray[index] = array[i];
                index++;
            }
        }

        return newArray;
    }

    function append(uint32[] memory A, uint32 B) internal pure returns (uint32[] memory) {
        uint32[] memory newAddresses = new uint32[](A.length + 1);
        for (uint32 i = 0; i < A.length; i++) {
            newAddresses[i] = A[i];
        }
        newAddresses[A.length] = B;
        return newAddresses;
    }
}
