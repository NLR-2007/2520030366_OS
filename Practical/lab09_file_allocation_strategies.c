/**
 * @file lab09_file_allocation_strategies.c
 * @brief File Allocation Strategies: Sequential (Contiguous) and Indexed Allocation
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>
#include <stdbool.h>

#define TOTAL_BLOCKS 50

void sequential_allocation(int start_block, int length, bool disk[]) {
    printf("\n--- Sequential (Contiguous) File Allocation ---\n");
    printf("Requested Start Block: %d, Length: %d blocks\n", start_block, length);

    bool can_allocate = true;
    for (int i = start_block; i < start_block + length; i++) {
        if (i >= TOTAL_BLOCKS || disk[i]) {
            can_allocate = false;
            break;
        }
    }

    if (can_allocate) {
        printf("Allocation SUCCESSFUL! Allocated blocks: ");
        for (int i = start_block; i < start_block + length; i++) {
            disk[i] = true;
            printf("%d ", i);
        }
        printf("\n");
    } else {
        printf("Allocation FAILED! Contiguous blocks not available or occupied.\n");
    }
}

void indexed_allocation(int index_block, int blocks[], int n, bool disk[]) {
    printf("\n--- Indexed File Allocation ---\n");
    printf("Index Block: %d\n", index_block);

    if (disk[index_block]) {
        printf("Allocation FAILED! Index block %d already allocated.\n", index_block);
        return;
    }

    disk[index_block] = true;
    printf("Index Block %d contains pointers to data blocks: ", index_block);
    for (int i = 0; i < n; i++) {
        disk[blocks[i]] = true;
        printf("%d ", blocks[i]);
    }
    printf("\nIndexed File Allocation SUCCESSFUL!\n");
}

int main() {
    bool disk[TOTAL_BLOCKS] = {false};

    printf("==================================================\n");
    printf("  OS Lab 09: File System Allocation Strategies\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n");

    sequential_allocation(10, 5, disk);
    sequential_allocation(12, 4, disk); // Conflict test

    int file_blocks[] = {4, 7, 19, 28, 33};
    indexed_allocation(1, file_blocks, 5, disk);

    return 0;
}
