/**
 * @file lab03_cpu_scheduling_rr_priority.c
 * @brief Preemptive CPU Scheduling Algorithms: Round Robin (RR) and Priority Scheduling
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>

#define MAX_PROC 10

struct Process {
    int pid;
    int burst_time;
    int remaining_time;
    int priority;
    int waiting_time;
    int turnaround_time;
};

void round_robin(struct Process proc[], int n, int time_quantum) {
    int time = 0, completed = 0;
    for (int i = 0; i < n; i++) proc[i].remaining_time = proc[i].burst_time;

    printf("\n--- Round Robin (Time Quantum = %d ms) Execution ---\n", time_quantum);
    while (completed < n) {
        int done_in_cycle = 0;
        for (int i = 0; i < n; i++) {
            if (proc[i].remaining_time > 0) {
                done_in_cycle = 1;
                if (proc[i].remaining_time > time_quantum) {
                    time += time_quantum;
                    proc[i].remaining_time -= time_quantum;
                    printf("T=%d ms: Process P%d executed for %d ms\n", time, proc[i].pid, time_quantum);
                } else {
                    time += proc[i].remaining_time;
                    proc[i].waiting_time = time - proc[i].burst_time;
                    proc[i].turnaround_time = time;
                    proc[i].remaining_time = 0;
                    completed++;
                    printf("T=%d ms: Process P%d FINISHED execution\n", time, proc[i].pid);
                }
            }
        }
        if (!done_in_cycle) break;
    }
}

int main() {
    int n = 3, quantum = 2;
    struct Process proc[] = {
        {1, 10, 10, 3, 0, 0},
        {2, 5, 5, 1, 0, 0},
        {3, 8, 8, 2, 0, 0}
    };

    printf("==================================================\n");
    printf("  OS Lab 03: Preemptive Round Robin CPU Scheduling\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n");

    round_robin(proc, n, quantum);

    float total_wt = 0, total_tat = 0;
    printf("\nPID\tBurst\tWaiting\tTurnaround\n");
    for (int i = 0; i < n; i++) {
        total_wt += proc[i].waiting_time;
        total_tat += proc[i].turnaround_time;
        printf("P%d\t%d\t%d\t%d\n", proc[i].pid, proc[i].burst_time, proc[i].waiting_time, proc[i].turnaround_time);
    }
    printf("Average Waiting Time: %.2f ms\n", total_wt / n);
    printf("Average Turnaround Time: %.2f ms\n", total_tat / n);

    return 0;
}
