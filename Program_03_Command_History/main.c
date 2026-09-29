#include <stdio.h>
#include <string.h>


int main()
{

char history[10][100];

char command[100];

int count=0;


while(1)
{

printf("OSSP-Shell> ");

fgets(command,100,stdin);

command[strlen(command)-1]='\0';


if(strcmp(command,"exit")==0)
break;


if(strcmp(command,"history")==0)
{

for(int i=0;i<count;i++)
{
printf("%d %s\n",i+1,history[i]);
}

continue;

}


strcpy(history[count],command);

count++;


}


return 0;

}
