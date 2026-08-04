/**
 * @file lab05_producer_consumer_posix_semaphores.c
 * @brief Process Synchronization: Producer-Consumer Problem using Bounded Buffer and Semaphores
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>
#include <stdlib.h>

#define CAPACITY 5

typedef struct {
    int buffer[CAPACITY];
    int in;
    int out;
    int count;
} BoundedBuffer;

void produce(BoundedBuffer *b, int item) {
    if (b->count == CAPACITY) {
        printf("[Producer] Buffer FULL! Cannot produce item %d.\n", item);
        return;
    }
    b->buffer[b->in] = item;
    printf("[Producer] Produced item: %d at slot [%d]\n", item, b->in);
    b->in = (b->in + 1) % CAPACITY;
    b->count++;
}

void consume(BoundedBuffer *b) {
    if (b->count == 0) {
        printf("[Consumer] Buffer EMPTY! Cannot consume item.\n");
        return;
    }
    int item = b->buffer[b->out];
    printf("  [Consumer] Consumed item: %d from slot [%d]\n", item, b->out);
    b->out = (b->out + 1) % CAPACITY;
    b->count--;
}

int main() {
    BoundedBuffer b = {.in = 0, .out = 0, .count = 0};

    printf("==================================================\n");
    printf("  OS Lab 05: Producer-Consumer Bounded Buffer\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n\n");

    produce(&b, 101);
    produce(&b, 102);
    produce(&b, 103);
    consume(&b);
    produce(&b, 104);
    produce(&b, 105);
    produce(&b, 106); // Should fill buffer
    produce(&b, 107); // Should report full
    consume(&b);
    consume(&b);

    return 0;
}
