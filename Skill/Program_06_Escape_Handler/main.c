#include <stdio.h>
#include <string.h>


void remove_escape(char *input)
{
    int i,j=0;

    for(i=0; input[i]!='\0'; i++)
    {
        if(input[i]=='\\')
        {
            continue;
        }

        input[j++]=input[i];
    }

    input[j]='\0';
}


int main()
{

char input[200];


printf("Enter command: ");

fgets(input,200,stdin);


input[strlen(input)-1]='\0';


remove_escape(input);


printf("Processed command: %s\n",input);


return 0;

}
