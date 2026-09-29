#include <stdio.h>
#include <string.h>

#define SIZE 10

char history[SIZE][100];

int count = 0;


void add_history(char *cmd)
{
    if(count < SIZE)
    {
        strcpy(history[count],cmd);
        count++;
    }
}


void show_history()
{
    int i;

    for(i=0;i<count;i++)
    {
        printf("%d : %s\n",i+1,history[i]);
    }
}


int main()
{

char command[100];


while(1)
{

printf("OSSP-Shell> ");

fgets(command,100,stdin);

command[strlen(command)-1]='\0';


if(strcmp(command,"exit")==0)
break;


if(strcmp(command,"history")==0)
{
    show_history();
    continue;
}


add_history(command);

printf("Executed : %s\n",command);

}

return 0;

}
