# 🖥️ Operating Systems (OS) Repository

> **Student & Project Info:**  
> **This Repo belongs to Nimma Lokesh Reddy | ID: 2520030366 | Section: S-06 | Batch: 20 | Course: Operating Systems & Systems Programming (OSSP)**

---

## 📌 Repository Overview

Welcome to the official **Operating Systems (OS)** repository maintained by **Nimma Lokesh Reddy** (`2520030366`), Section S-06, Batch 20. This repository contains organized coursework, practical lab implementations, skill development modules, and major kernel project documentation for the Operating Systems course.

- 🔗 **Operating Systems Repository:** [https://github.com/NLR-2007/2520030366_OS](https://github.com/NLR-2007/2520030366_OS)
- 🚀 **Major Project Repository (BlackPanther OS):** [https://github.com/NLR-2007/BlackPanther_OSSP_S6](https://github.com/NLR-2007/BlackPanther_OSSP_S6)

---

## 📁 Repository Structure

```text
2520030366_OS/
├── 📂 Practical/       # Weekly lab experiments, CPU scheduling, IPC, memory management & disk algorithms
├── 📂 Skill/           # Skill development tasks, multithreading, synchronization & low-level memory allocation
└── 📂 Project/         # Main OS kernel project (BlackPanther OS) source code and documentation
```

### 📑 Folder Summaries

| Folder | Description | Repository Link |
| :--- | :--- | :--- |
| [**Practical**](./Practical/) | Contains all weekly practical lab experiments, C implementation files, and lab documentation. | [Explore Practical Folder](./Practical/) |
| [**Skill**](./Skill/) | Contains skill building tasks, system programming exercises, and advanced OS practice modules. | [Explore Skill Folder](./Skill/) |
| [**Project**](./Project/) | Contains the BlackPanther OS 32-bit Kernel source code, architecture details, and project documentation. | [BlackPanther OS GitHub Repo](https://github.com/NLR-2007/BlackPanther_OSSP_S6) |

---

## 🛠️ Updated Practical Files List (`/Practical`)

The `Practical/` folder contains hands-on laboratory experiment files covering fundamental Operating Systems concepts:

| File Name | Experiment Topic & Description | Language |
| :--- | :--- | :---: |
| [**lab01_process_creation.c**](./Practical/lab01_process_creation.c) | Process Management: `fork()`, `exec()`, `wait()`, `getpid()`, and parent-child hierarchy | C |
| [**lab02_cpu_scheduling_fcfs_sjf.c**](./Practical/lab02_cpu_scheduling_fcfs_sjf.c) | Non-Preemptive CPU Scheduling: FCFS and Shortest Job First (SJF) metrics | C |
| [**lab03_cpu_scheduling_rr_priority.c**](./Practical/lab03_cpu_scheduling_rr_priority.c) | Preemptive CPU Scheduling: Round Robin (RR) with time quantum and Priority Scheduling | C |
| [**lab04_ipc_pipes_shared_memory.c**](./Practical/lab04_ipc_pipes_shared_memory.c) | Inter-Process Communication (IPC): POSIX Anonymous Pipes and Shared Memory | C |
| [**lab05_producer_consumer_posix_semaphores.c**](./Practical/lab05_producer_consumer_posix_semaphores.c) | Process Synchronization: Bounded Buffer Producer-Consumer with Semaphores & Mutex | C |
| [**lab06_bankers_algorithm_deadlock.c**](./Practical/lab06_bankers_algorithm_deadlock.c) | Deadlock Avoidance: Dijkstra's Banker's Algorithm safety check & resource allocation | C |
| [**lab07_memory_allocation_strategies.c**](./Practical/lab07_memory_allocation_strategies.c) | Contiguous Memory Allocation: First-Fit, Best-Fit, and Worst-Fit allocation strategies | C |
| [**lab08_page_replacement_fifo_lru.c**](./Practical/lab08_page_replacement_fifo_lru.c) | Virtual Memory: FIFO and LRU (Least Recently Used) Page Replacement algorithms | C |
| [**lab09_file_allocation_strategies.c**](./Practical/lab09_file_allocation_strategies.c) | File Systems: Sequential (Contiguous) and Indexed File Allocation strategies | C |
| [**lab10_disk_scheduling_scan_cscan.c**](./Practical/lab10_disk_scheduling_scan_cscan.c) | Disk Head Scheduling: SCAN (Elevator) and C-SCAN cylinder seek optimization | C |

---

## 🎯 Updated Skill Files List (`/Skill`)

The `Skill/` folder contains advanced system-level programming modules and concurrency algorithms:

| File Name | Skill Task & Topic Description | Language |
| :--- | :--- | :---: |
| [**skill01_custom_shell_scripting.sh**](./Skill/skill01_custom_shell_scripting.sh) | Systems Automation: Process inspection, memory monitoring, and automated log parsing | Bash |
| [**skill02_posix_multithreading_matrix.c**](./Skill/skill02_posix_multithreading_matrix.c) | Multithreading & Concurrency: POSIX Pthreads parallel matrix multiplication | C |
| [**skill03_readers_writers_mutex.c**](./Skill/skill03_readers_writers_mutex.c) | Synchronization: Readers-Writers problem using Mutex and Reader-Preference locks | C |
| [**skill04_dining_philosophers_problem.c**](./Skill/skill04_dining_philosophers_problem.c) | Classic Synchronization: Dining Philosophers solution with deadlock avoidance | C |
| [**skill05_lru_cache_simulator.c**](./Skill/skill05_lru_cache_simulator.c) | Low-Level Data Structures: LRU Page Cache simulator using Hash Map + Doubly Linked List | C |
| [**skill06_custom_malloc_free_allocator.c**](./Skill/skill06_custom_malloc_free_allocator.c) | Heap Memory Architecture: Custom heap memory manager (`my_malloc` and `my_free`) | C |

---

## 🚀 Major OS Kernel Project

- **Project Name:** BlackPanther OS (OSSP S6)
- **Description:** A 32-bit x86 Preemptive Multitasking Operating System Kernel written from scratch in C and x86 Assembly. Features Multiboot compliance, GDT/IDT setups, bitmap physical memory manager (PMM), 2-level paging virtual memory manager (VMM), custom kernel heap, round-robin scheduler, RAMDisk VFS, and an interactive shell interface.
- **GitHub Repository Link:** [https://github.com/NLR-2007/BlackPanther_OSSP_S6](https://github.com/NLR-2007/BlackPanther_OSSP_S6)

---

## 👤 Student Details

- **Name:** Nimma Lokesh Reddy
- **ID / Register Number:** `2520030366`
- **Section:** S-06
- **Batch:** 20
- **Course:** Operating Systems & Systems Programming (OSSP)
- **Primary OS GitHub Repo:** [https://github.com/NLR-2007/2520030366_OS](https://github.com/NLR-2007/2520030366_OS)
- **OS Kernel Project Repo:** [https://github.com/NLR-2007/BlackPanther_OSSP_S6](https://github.com/NLR-2007/BlackPanther_OSSP_S6)

---

## 📜 License

This repository is maintained for academic coursework and Operating Systems project submissions for Section S-06, Batch 20.
