import { Component, OnInit } from '@angular/core';

export class Pokemon {
  id?: string;
  name?: string;
  image?: string;
  silhouette?: string;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  pokemonList: Pokemon[] = [];
  displayedPokemonList: Pokemon[] = [];  // Array for the 4 random Pokémon
  currentPokemon: Pokemon = new Pokemon();
  score: number = 0;
  pokemonImageSource: string = "";
  feedbackContent: string = "";
  answerDisabled: boolean = false;
  nextButtonDisabled: boolean = true;  // Initially disabled until user answers

  async ngOnInit(): Promise<void> {
    try {
      await this.populatePokemonList();  // Wait for the list to populate
      this.loadNewPokemon();  // Then load a new set of Pokémon
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }  

  getRandomPokemonFromList(): Pokemon {
    return this.displayedPokemonList[Math.floor(Math.random() * this.displayedPokemonList.length)];
  }

  processAnswer(event: Event) {
    const selectedName = (event.target as HTMLButtonElement).textContent?.trim();

    if (selectedName === this.currentPokemon.name) {
      this.feedbackContent = `Correct! It's ${this.currentPokemon.name}!`;
      this.score++;
    } else {
      this.feedbackContent = `Incorrect! It's actually ${this.currentPokemon.name}!`;
    }

    this.pokemonImageSource = this.currentPokemon.image!;
    this.answerDisabled = true;  // Disable buttons after selection
    this.nextButtonDisabled = false;  // Enable the next button
  }

  loadNewPokemon() {
    if (this.pokemonList.length < 4) {
      console.error('Not enough Pokémon to display.');
      return;
    }

    // Shuffle and select 4 Pokémon
    this.shuffleArray(this.pokemonList);
    this.displayedPokemonList = this.pokemonList.slice(0, 4);

    // Choose one of the 4 Pokémon as the current Pokémon
    this.currentPokemon = this.getRandomPokemonFromList();

    // Set the silhouette image as the quiz image
    this.pokemonImageSource = this.currentPokemon.silhouette!;
    this.feedbackContent = '';

    // Enable the answer buttons and disable the next button
    this.answerDisabled = false;
    this.nextButtonDisabled = true;
  }

  shuffleArray(array: any[]) {
    try {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    } catch (error) {
      console.error('Error shuffling Pokémon list.', error);
    }
  }
  

  async populatePokemonList() {
    try {
      const response = await fetch('http://localhost:8088/api/pokemon');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      this.pokemonList = data;
      this.loadNewPokemon();  // Load initial Pokémon after fetching
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }
}


