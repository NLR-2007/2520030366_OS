/**
 * @file lab10_disk_scheduling_scan_cscan.c
 * @brief Disk Head Scheduling Algorithms: SCAN (Elevator) and C-SCAN Algorithms
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>
#include <stdlib.h>

#define DISK_SIZE 200

void sort_requests(int req[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = i + 1; j < n; j++) {
            if (req[i] > req[j]) {
                int temp = req[i];
                req[i] = req[j];
                req[j] = temp;
            }
        }
    }
}

void scan_disk_scheduling(int req[], int n, int head) {
    int total_seek = 0;
    int sorted_req[100];
    for (int i = 0; i < n; i++) sorted_req[i] = req[i];
    sorted_req[n] = DISK_SIZE - 1; // End of disk
    n++;

    sort_requests(sorted_req, n);

    printf("\n--- SCAN (Elevator) Disk Scheduling ---\n");
    printf("Initial Head Position: %d\nSeek Path: %d", head, head);

    int pos = 0;
    while (pos < n && sorted_req[pos] < head) pos++;

    // Moving right towards DISK_SIZE - 1
    for (int i = pos; i < n; i++) {
        total_seek += abs(sorted_req[i] - head);
        head = sorted_req[i];
        printf(" -> %d", head);
    }

    // Moving left for remaining
    for (int i = pos - 1; i >= 0; i--) {
        total_seek += abs(sorted_req[i] - head);
        head = sorted_req[i];
        printf(" -> %d", head);
    }

    printf("\nTotal Seek Operations (SCAN): %d cylinders\n", total_seek);
}

int main() {
    int requests[] = {98, 183, 37, 122, 14, 124, 65, 67};
    int n = sizeof(requests) / sizeof(requests[0]);
    int initial_head = 53;

    printf("==================================================\n");
    printf("  OS Lab 10: SCAN Disk Scheduling Algorithm\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n");

    scan_disk_scheduling(requests, n, initial_head);

    return 0;
}
