#include <stdio.h>
#include <string.h>

int main()
{
    char command[100];

    while(1)
    {
        printf("OSSP-Shell> ");

        fgets(command,sizeof(command),stdin);

        command[strlen(command)-1]='\0';


        if(strcmp(command,"exit")==0)
        {
            printf("Shell terminated\n");
            break;
        }


        printf("You entered: %s\n",command);
    }

    return 0;
}
