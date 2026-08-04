/**
 * @file lab08_page_replacement_fifo_lru.c
 * @brief Virtual Memory Page Replacement Algorithms: FIFO and LRU
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>
#include <stdbool.h>

#define FRAMES 3

void fifo_page_replacement(int pages[], int n) {
    int frames[FRAMES];
    for (int i = 0; i < FRAMES; i++) frames[i] = -1;

    int page_faults = 0, index = 0;

    printf("\n--- FIFO Page Replacement (Frames = %d) ---\n", FRAMES);
    printf("Reference String\tFrame Status\t\tPage Fault?\n");

    for (int i = 0; i < n; i++) {
        bool hit = false;
        for (int j = 0; j < FRAMES; j++) {
            if (frames[j] == pages[i]) {
                hit = true;
                break;
            }
        }

        if (!hit) {
            frames[index] = pages[i];
            index = (index + 1) % FRAMES;
            page_faults++;
            printf("%d\t\t\t[%d, %d, %d]\t\tYES (Fault #%d)\n", pages[i], frames[0], frames[1], frames[2], page_faults);
        } else {
            printf("%d\t\t\t[%d, %d, %d]\t\tNO (Hit)\n", pages[i], frames[0], frames[1], frames[2]);
        }
    }
    printf("Total FIFO Page Faults: %d\n", page_faults);
}

void lru_page_replacement(int pages[], int n) {
    int frames[FRAMES], time[FRAMES];
    for (int i = 0; i < FRAMES; i++) { frames[i] = -1; time[i] = 0; }

    int page_faults = 0, counter = 0;

    printf("\n--- LRU Page Replacement (Frames = %d) ---\n", FRAMES);
    printf("Reference String\tFrame Status\t\tPage Fault?\n");

    for (int i = 0; i < n; i++) {
        bool hit = false;
        for (int j = 0; j < FRAMES; j++) {
            if (frames[j] == pages[i]) {
                counter++;
                hit = true;
                time[j] = counter;
                break;
            }
        }

        if (!hit) {
            int lru_idx = 0, min_time = time[0];
            for (int j = 1; j < FRAMES; j++) {
                if (frames[j] == -1) { lru_idx = j; break; }
                if (time[j] < min_time) { min_time = time[j]; lru_idx = j; }
            }
            counter++;
            frames[lru_idx] = pages[i];
            time[lru_idx] = counter;
            page_faults++;
            printf("%d\t\t\t[%d, %d, %d]\t\tYES (Fault #%d)\n", pages[i], frames[0], frames[1], frames[2], page_faults);
        } else {
            printf("%d\t\t\t[%d, %d, %d]\t\tNO (Hit)\n", pages[i], frames[0], frames[1], frames[2]);
        }
    }
    printf("Total LRU Page Faults: %d\n", page_faults);
}

int main() {
    int pages[] = {7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2};
    int n = sizeof(pages) / sizeof(pages[0]);

    printf("==================================================\n");
    printf("  OS Lab 08: FIFO & LRU Page Replacement Algorithms\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n");

    fifo_page_replacement(pages, n);
    lru_page_replacement(pages, n);

    return 0;
}
