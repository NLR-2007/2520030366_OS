#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdlib.h>

int main()
{
    pid_t pid;

    printf("OSSP Program 01\n");

    pid = fork();

    if(pid < 0)
    {
        printf("Fork failed\n");
        return 1;
    }

    else if(pid == 0)
    {
        printf("Child Process\n");
        printf("Child PID: %d\n", getpid());

        execl("/bin/ls","ls",NULL);

        printf("Exec failed\n");
    }

    else
    {
        printf("Parent Process\n");
        printf("Parent PID: %d\n", getpid());

        waitpid(pid,NULL,0);

        printf("Child completed\n");
    }

    return 0;
}
