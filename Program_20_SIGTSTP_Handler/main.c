#include <stdio.h>
#include <signal.h>
#include <unistd.h>


void stop_handler(int sig)
{

printf("\nProcess stopped signal: %d\n",sig);

}



int main()
{


signal(SIGTSTP,stop_handler);



while(1)
{

printf("Process active\n");

sleep(2);

}


return 0;

}
