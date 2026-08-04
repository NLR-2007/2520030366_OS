/**
 * @file lab02_cpu_scheduling_fcfs_sjf.c
 * @brief Non-Preemptive CPU Scheduling Algorithms: FCFS and SJF (Shortest Job First)
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>

struct Process {
    int pid;
    int burst_time;
    int arrival_time;
    int waiting_time;
    int turnaround_time;
};

void calculate_times(struct Process proc[], int n) {
    int current_time = 0;
    for (int i = 0; i < n; i++) {
        if (current_time < proc[i].arrival_time) {
            current_time = proc[i].arrival_time;
        }
        proc[i].waiting_time = current_time - proc[i].arrival_time;
        proc[i].turnaround_time = proc[i].waiting_time + proc[i].burst_time;
        current_time += proc[i].burst_time;
    }
}

void print_metrics(struct Process proc[], int n, const char* alg_name) {
    float total_wt = 0, total_tat = 0;
    printf("\n--- %s CPU Scheduling Results ---\n", alg_name);
    printf("PID\tArrival\tBurst\tWaiting\tTurnaround\n");
    for (int i = 0; i < n; i++) {
        total_wt += proc[i].waiting_time;
        total_tat += proc[i].turnaround_time;
        printf("P%d\t%d\t%d\t%d\t%d\n", proc[i].pid, proc[i].arrival_time, proc[i].burst_time, proc[i].waiting_time, proc[i].turnaround_time);
    }
    printf("Average Waiting Time: %.2f ms\n", total_wt / n);
    printf("Average Turnaround Time: %.2f ms\n", total_tat / n);
}

void sort_by_sjf(struct Process proc[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = i + 1; j < n; j++) {
            if (proc[i].burst_time > proc[j].burst_time) {
                struct Process temp = proc[i];
                proc[i] = proc[j];
                proc[j] = temp;
            }
        }
    }
}

int main() {
    int n = 4;
    struct Process fcfs_proc[] = {{1, 6, 0, 0, 0}, {2, 8, 0, 0, 0}, {3, 7, 0, 0, 0}, {4, 3, 0, 0, 0}};
    struct Process sjf_proc[]  = {{1, 6, 0, 0, 0}, {2, 8, 0, 0, 0}, {3, 7, 0, 0, 0}, {4, 3, 0, 0, 0}};

    printf("==================================================\n");
    printf("  OS Lab 02: FCFS & SJF CPU Scheduling\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n");

    // FCFS
    calculate_times(fcfs_proc, n);
    print_metrics(fcfs_proc, n, "First-Come First-Served (FCFS)");

    // SJF
    sort_by_sjf(sjf_proc, n);
    calculate_times(sjf_proc, n);
    print_metrics(sjf_proc, n, "Shortest Job First (SJF)");

    return 0;
}
