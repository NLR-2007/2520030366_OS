#include <stdio.h>
#include <signal.h>
#include <unistd.h>


void sigint_handler(int sig)
{

printf("\nCannot terminate shell\n");

}



int main()
{


signal(SIGINT,sigint_handler);



while(1)
{

printf("OSSP-Shell Running\n");

sleep(2);

}



return 0;

}
