import pygame
import sys
import random
import time

# Initialize Pygame
pygame.init()

# Set up some constants
WIDTH = 800
HEIGHT = 600
BLOCK_SIZE = 20
FPS = 10

# Create the game window
win = pygame.display.set_mode((WIDTH, HEIGHT))

# Define some colors
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

# Set up the font for the score and instructions
font = pygame.font.Font(None, 36)
instructions_font = pygame.font.Font(None, 24)

class SnakeGame:
    def __init__(self):
        self.snake_pos = [100, 50]
        self.snake_body = [[100, 50], [90, 50], [80, 50]]
        self.direction = 'RIGHT'
        self.food_pos = self.generate_food()
        self.score = 0
        self.lives = 3

    def generate_food(self):
        while True:
            food_x = random.randrange(1, (WIDTH // BLOCK_SIZE)) * BLOCK_SIZE
            food_y = random.randrange(1, (HEIGHT // BLOCK_SIZE)) * BLOCK_SIZE
            if [food_x, food_y] not in self.snake_body:
                return [food_x, food_y]

    def move_snake(self):
        for i in range(len(self.snake_body) - 1, 0, -1):
            x, y = self.snake_body[i]
            self.snake_body[i] = (self.snake_body[i-1][0], self.snake_body[i-1][1])

        if self.direction == 'UP':
            self.snake_pos[1] -= BLOCK_SIZE
        elif self.direction == 'DOWN':
            self.snake_pos[1] += BLOCK_SIZE
        elif self.direction == 'LEFT':
            self.snake_pos[0] -= BLOCK_SIZE
        elif self.direction == 'RIGHT':
            self.snake_pos[0] += BLOCK_SIZE

    def check_collision(self):
        if (self.snake_pos[0] < 0 or self.snake_pos[0] >= WIDTH or
                self.snake_pos[1] < 0 or self.snake_pos[1] >= HEIGHT or
                self.snake_pos in self.snake_body[:-1]):
            return True
        else:
            return False

    def draw_everything(self):
        win.fill((0, 0, 0))
        for pos in self.snake_body:
            pygame.draw.rect(win, GREEN, (pos[0], pos[1], BLOCK_SIZE, BLOCK_SIZE))
        pygame.draw.rect(win, RED, (self.food_pos[0], self.food_pos[1], BLOCK_SIZE, BLOCK_SIZE))

        text = font.render(f'Score: {self.score}', True, WHITE)
        win.blit(text, (10, 10))

        text = font.render('Lives: ' + str(self.lives), True, WHITE)
        win.blit(text, (WIDTH - 150, 10))

    def play(self):
        clock = pygame.time.Clock()
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_LEFT and self.direction != 'RIGHT':
                        self.direction = 'LEFT'
                    elif event.key == pygame.K_RIGHT and self.direction != 'LEFT':
                        self.direction = 'RIGHT'
                    elif event.key == pygame.K_UP and self.direction != 'DOWN':
                        self.direction = 'UP'
                    elif event.key == pygame.K_DOWN and self.direction != 'UP':
                        self.direction = 'DOWN'

            if not self.check_collision():
                self.move_snake()
                if self.snake_pos == self.food_pos:
                    self.score += 1
                    self.food_pos = self.generate_food()
                else:
                    self.snake_body.pop()

                if len(self.snake_body) > self.lives * BLOCK_SIZE:
                    self.lives -= 1

            win.fill((0, 0, 0))
            self.draw_everything()
            pygame.display.update()
            clock.tick(FPS)

        text = font.render('Game Over!', True, WHITE)
        win.blit(text, (WIDTH // 2 - 50, HEIGHT // 2))

        if self.score > 100:
            text = font.render(f'Your score: {self.score}', True, WHITE)
            win.blit(text, (WIDTH // 2 - 75, HEIGHT // 2 + 30))
        elif self.lives == 0:
            text = font.render('Game Over! You lost.', True, WHITE)
            win.blit(text, (WIDTH // 2 - 100, HEIGHT // 2 + 30))

        pygame.display.update()
        time.sleep(1)

if __name__ == "__main__":
    game = SnakeGame()
    game.play()
