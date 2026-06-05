.global main
.global init_grid
.global count_neighbors
.global update_generation
.global print_grid

.data
GRID_SIZE: .word 8              @ 8x8 grid
current_grid: .space 64         @ 8x8 = 64 bytes for current generation
next_grid: .space 64            @ 8x8 = 64 bytes for next generation
neighbor_count: .word 0
temp_x: .word 0
temp_y: .word 0
temp_row: .word 0

.text

@ Initialize grid with random or pattern
@ r0 = grid pointer
@ r1 = size (8 for 8x8)
init_grid:
    push {r4, r5, r6, lr}
    mov r4, r0                  @ r4 = grid pointer
    mov r5, r1                  @ r5 = size
    mov r6, #0                  @ r6 = counter
    
init_loop:
    cmp r6, r5
    bge init_done
    
    @ Simple pattern: alternate on/off
    and r0, r6, #1
    strb r0, [r4, r6]
    
    add r6, r6, #1
    b init_loop
    
init_done:
    pop {r4, r5, r6, pc}


@ Count live neighbors for cell at (x, y)
@ r0 = x coordinate
@ r1 = y coordinate
@ r2 = grid pointer
@ r3 = grid size
@ Returns: r0 = neighbor count
count_neighbors:
    push {r4, r5, r6, r7, r8, r9, lr}
    
    mov r4, r0                  @ r4 = x
    mov r5, r1                  @ r5 = y
    mov r6, r2                  @ r6 = grid pointer
    mov r7, r3                  @ r7 = grid size
    mov r8, #0                  @ r8 = neighbor count
    mov r9, #-1                 @ r9 = dx (start at -1)
    
dx_loop:
    cmp r9, #2
    bge count_done
    
    mov r10, #-1                @ r10 = dy
    
dy_loop:
    cmp r10, #2
    bge dx_increment
    
    @ Skip the center cell (0, 0)
    cmp r9, #0
    cmpeq r10, #0
    beq dy_increment
    
    @ Calculate neighbor coordinates
    add r0, r4, r9              @ x + dx
    add r1, r5, r10             @ y + dy
    
    @ Check bounds
    cmp r0, #0
    blt dy_increment
    cmp r0, r7
    bge dy_increment
    cmp r1, #0
    blt dy_increment
    cmp r1, r7
    bge dy_increment
    
    @ Get cell value from grid
    mul r2, r1, r7              @ row offset = y * size
    add r2, r2, r0              @ index = (y * size) + x
    ldrb r3, [r6, r2]           @ r3 = grid[index]
    
    @ Increment neighbor count if cell is alive
    cmp r3, #1
    addeq r8, r8, #1
    
dy_increment:
    add r10, r10, #1
    b dy_loop
    
dx_increment:
    add r9, r9, #1
    b dx_loop
    
count_done:
    mov r0, r8                  @ return neighbor count
    pop {r4, r5, r6, r7, r8, r9, pc}


@ Update one generation
@ r0 = current grid pointer
@ r1 = next grid pointer
@ r2 = grid size
update_generation:
    push {r4, r5, r6, r7, r8, r9, r10, lr}
    
    mov r4, r0                  @ r4 = current grid
    mov r5, r1                  @ r5 = next grid
    mov r6, r2                  @ r6 = grid size
    mov r7, #0                  @ r7 = y counter
    
y_loop:
    cmp r7, r6
    bge update_done
    
    mov r8, #0                  @ r8 = x counter
    
x_loop:
    cmp r8, r6
    bge y_increment
    
    @ Count neighbors for cell at (x, y)
    mov r0, r8                  @ x coordinate
    mov r1, r7                  @ y coordinate
    mov r2, r4                  @ current grid
    mov r3, r6                  @ grid size
    bl count_neighbors
    mov r9, r0                  @ r9 = neighbor count
    
    @ Get current cell state
    mul r10, r7, r6             @ row offset
    add r10, r10, r8            @ index = (y * size) + x
    ldrb r0, [r4, r10]          @ r0 = current cell state
    
    @ Apply Game of Life rules
    @ Any live cell with 2-3 neighbors survives
    @ Any dead cell with exactly 3 neighbors becomes alive
    @ Otherwise, cell dies
    
    mov r1, #0                  @ r1 = next state (default: dead)
    
    @ Check if cell should be alive
    cmp r0, #1                  @ Is cell currently alive?
    beq alive_cell
    
    @ Dead cell rules
    cmp r9, #3                  @ Does it have exactly 3 neighbors?
    moveq r1, #1                @ If yes, becomes alive
    b store_next_state
    
alive_cell:
    @ Alive cell rules
    cmp r9, #2                  @ Less than 2 neighbors?
    blt cell_dies
    cmp r9, #3                  @ More than 3 neighbors?
    bgt cell_dies
    
    mov r1, #1                  @ Cell survives (2-3 neighbors)
    b store_next_state
    
cell_dies:
    mov r1, #0                  @ Cell dies
    
store_next_state:
    strb r1, [r5, r10]          @ Store in next grid
    
    add r8, r8, #1
    b x_loop
    
y_increment:
    add r7, r7, #1
    b y_loop
    
update_done:
    pop {r4, r5, r6, r7, r8, r9, r10, pc}


@ Print grid to console (simple format)
@ r0 = grid pointer
@ r1 = grid size
print_grid:
    push {r4, r5, r6, r7, lr}
    
    mov r4, r0                  @ r4 = grid pointer
    mov r5, r1                  @ r5 = grid size
    mov r6, #0                  @ r6 = y counter
    
print_y_loop:
    cmp r6, r5
    bge print_done
    
    mov r7, #0                  @ r7 = x counter
    
print_x_loop:
    cmp r7, r5
    bge print_newline
    
    @ Get cell value
    mul r0, r6, r5
    add r0, r0, r7
    ldrb r0, [r4, r0]
    
    @ Print '*' for alive, '.' for dead
    cmp r0, #1
    
    @ Would use syscall to print here
    @ For now, just mark positions conceptually
    
    add r7, r7, #1
    b print_x_loop
    
print_newline:
    add r6, r6, #1
    b print_y_loop
    
print_done:
    pop {r4, r5, r6, r7, pc}


@ Main entry point - simulate several generations
main:
    push {r4, r5, r6, lr}
    
    @ Initialize current grid
    ldr r0, =current_grid
    mov r1, #8
    bl init_grid
    
    @ Run 10 generations
    mov r4, #0                  @ r4 = generation counter
    
generation_loop:
    cmp r4, #10
    bge sim_done
    
    @ Update to next generation
    ldr r0, =current_grid
    ldr r1, =next_grid
    mov r2, #8
    bl update_generation
    
    @ Copy next_grid back to current_grid
    ldr r0, =next_grid
    ldr r1, =current_grid
    mov r2, #0
    
copy_loop:
    cmp r2, #64
    bge copy_done
    
    ldrb r3, [r0, r2]
    strb r3, [r1, r2]
    add r2, r2, #1
    b copy_loop
    
copy_done:
    @ Print current generation (conceptual)
    ldr r0, =current_grid
    mov r1, #8
    bl print_grid
    
    add r4, r4, #1
    b generation_loop
    
sim_done:
    mov r0, #0                  @ exit code
    pop {r4, r5, r6, pc}
