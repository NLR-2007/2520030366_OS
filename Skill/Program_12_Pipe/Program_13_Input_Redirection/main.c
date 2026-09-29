#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>


int main()
{

int fd;


fd=open("input.txt",O_RDONLY);


dup2(fd,STDIN_FILENO);


close(fd);



execlp("cat","cat",NULL);


return 0;

}
