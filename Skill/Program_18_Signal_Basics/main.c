#include <stdio.h>
#include <signal.h>
#include <unistd.h>


void handler(int sig)
{

printf("\nSignal received: %d\n",sig);

}



int main()
{


signal(SIGINT,handler);



while(1)
{

printf("Running...\n");

sleep(2);

}


return 0;

}
