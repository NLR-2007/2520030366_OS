# 🛠️ Operating Systems - Practical Experiments Folder

> **Student Details:** Nimma Lokesh Reddy | **ID:** 2520030366 | **Section:** S-06 | **Batch:** 20  
> **Course:** Operating Systems & Systems Programming (OSSP)  
> **OS Repository:** [https://github.com/NLR-2007/2520030366_OS](https://github.com/NLR-2007/2520030366_OS)

---

## 📌 Practical Experiments Catalog

This folder contains hands-on C source code files for core Operating System laboratory experiments:

| Experiment File | Topic & Description | Compile Command |
| :--- | :--- | :--- |
| [**lab01_process_creation.c**](./lab01_process_creation.c) | Process Management: `fork()`, `exec()`, `wait()`, PID tracking | `gcc lab01_process_creation.c -o lab01` |
| [**lab02_cpu_scheduling_fcfs_sjf.c**](./lab02_cpu_scheduling_fcfs_sjf.c) | Non-Preemptive CPU Scheduling: FCFS and SJF execution metrics | `gcc lab02_cpu_scheduling_fcfs_sjf.c -o lab02` |
| [**lab03_cpu_scheduling_rr_priority.c**](./lab03_cpu_scheduling_rr_priority.c) | Preemptive CPU Scheduling: Round Robin & Priority Scheduling | `gcc lab03_cpu_scheduling_rr_priority.c -o lab03` |
| [**lab04_ipc_pipes_shared_memory.c**](./lab04_ipc_pipes_shared_memory.c) | Inter-Process Communication: Pipes & Shared Memory | `gcc lab04_ipc_pipes_shared_memory.c -o lab04` |
| [**lab05_producer_consumer_posix_semaphores.c**](./lab05_producer_consumer_posix_semaphores.c) | Synchronization: Bounded Buffer Producer-Consumer | `gcc lab05_producer_consumer_posix_semaphores.c -o lab05` |
| [**lab06_bankers_algorithm_deadlock.c**](./lab06_bankers_algorithm_deadlock.c) | Deadlock Avoidance: Banker's Algorithm safety checking | `gcc lab06_bankers_algorithm_deadlock.c -o lab06` |
| [**lab07_memory_allocation_strategies.c**](./lab07_memory_allocation_strategies.c) | Memory Allocation: First-Fit, Best-Fit, Worst-Fit algorithms | `gcc lab07_memory_allocation_strategies.c -o lab07` |
| [**lab08_page_replacement_fifo_lru.c**](./lab08_page_replacement_fifo_lru.c) | Virtual Memory: FIFO and LRU Page Replacement algorithms | `gcc lab08_page_replacement_fifo_lru.c -o lab08` |
| [**lab09_file_allocation_strategies.c**](./lab09_file_allocation_strategies.c) | File Systems: Sequential and Indexed File Allocation | `gcc lab09_file_allocation_strategies.c -o lab09` |
| [**lab10_disk_scheduling_scan_cscan.c**](./lab10_disk_scheduling_scan_cscan.c) | Disk Scheduling: SCAN (Elevator) algorithm seek optimization | `gcc lab10_disk_scheduling_scan_cscan.c -o lab10` |

---

## 💻 How to Run Practical Experiments

To compile and run any experiment on Linux/WSL/GCC:
```bash
gcc lab01_process_creation.c -o lab01
./lab01
```
