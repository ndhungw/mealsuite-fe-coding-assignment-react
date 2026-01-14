import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { createUsersQueryOptions } from '@/queries/users/create-users-query-options';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function AssigneeCombobox({
  assigneeId,
  className,
  onSelect,
  disabled,
}: {
  assigneeId: number | null;
  onSelect?: (assigneeId: number | null) => Promise<void> | void;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(null);

  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useQuery(createUsersQueryOptions());

  useEffect(() => {
    setValue(assigneeId);
  }, [assigneeId]);

  const handleSelect = (selectedValue: string) => {
    const selectedUser = users?.find((user) => user.id.toString() === selectedValue);
    setValue(selectedUser ? selectedUser.id : null);
    setOpen(false);
    if (onSelect) {
      onSelect(selectedUser ? selectedUser.id : null);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        asChild
        disabled={isLoadingUsers || isErrorUsers}
      >
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-28 justify-between', className)}
          disabled={isLoadingUsers || isErrorUsers || disabled}
        >
          <span className='truncate min-w-0'>
            {value ? users?.find((user) => user.id === value)?.name : 'Select a user...'}
          </span>
          <ChevronsUpDown className='opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-max max-w-xs p-0'
      >
        <Command
          filter={(value, search) => {
            const user = users?.find((user) => user.id.toString() === value);
            return user?.name.includes(search) ? 1 : 0;
          }}
        >
          <CommandInput
            placeholder='Search a user'
            className='h-9'
          />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandSeparator />
            <CommandGroup heading='Users'>
              {users?.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id.toString()}
                  onSelect={handleSelect}
                >
                  <span className='truncate min-w-0'>{user.name}</span>
                  <Check
                    className={cn(
                      'ml-auto',
                      user.id !== undefined && value === user.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
