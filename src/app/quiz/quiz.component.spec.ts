import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizComponent, Pokemon } from './quiz.component';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

describe('QuizComponent', () => {
  let component: QuizComponent;
  let fixture: ComponentFixture<QuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize and load new Pokémon', async () => {
      spyOn(component, 'populatePokemonList').and.returnValue(Promise.resolve());
      spyOn(component, 'loadNewPokemon');
      
      await component.ngOnInit();
      
      expect(component.populatePokemonList).toHaveBeenCalled();
      expect(component.loadNewPokemon).toHaveBeenCalled();
    });

    it('should handle errors in ngOnInit', async () => {
      spyOn(component, 'populatePokemonList').and.returnValue(Promise.reject('Error'));
      spyOn(console, 'error');
      
      await component.ngOnInit();
      
      expect(console.error).toHaveBeenCalledWith('Error in ngOnInit:', 'Error');
    });
  });

  describe('processAnswer', () => {
    it('should update feedbackContent and score when the correct answer is selected', () => {
      component.currentPokemon = { name: 'Pikachu', image: 'pikachu.png' };
      const event = { target: { textContent: 'Pikachu' } } as unknown as Event;
      
      component.processAnswer(event);
      
      expect(component.feedbackContent).toBe('Correct! It\'s Pikachu!');
      expect(component.score).toBe(1);
      expect(component.answerDisabled).toBeTrue();
      expect(component.nextButtonDisabled).toBeFalse();
    });

    it('should update feedbackContent and reset score when the incorrect answer is selected', () => {
      component.currentPokemon = { name: 'Pikachu', image: 'pikachu.png' };
      const event = { target: { textContent: 'Charmander' } } as unknown as Event;
      
      component.processAnswer(event);
      
      expect(component.feedbackContent).toBe('Incorrect! It\'s actually Pikachu!');
      expect(component.score).toBe(0);
      expect(component.answerDisabled).toBeTrue();
      expect(component.nextButtonDisabled).toBeFalse();
    });
  });

  describe('loadNewPokemon', () => {
    it('should handle the case when there are not enough Pokémon', () => {
      component.pokemonList = [];
      
      component.loadNewPokemon();
      
      expect(component.pokemonList.length).toBe(0);
    });

    it('should shuffle Pokémon list and set a new current Pokémon', () => {
      const pokemonList: Pokemon[] = [
        { id: '1', name: 'Pikachu', silhouette: 'pikachu-silhouette.png' },
        { id: '2', name: 'Charmander', silhouette: 'charmander-silhouette.png' },
        { id: '3', name: 'Bulbasaur', silhouette: 'bulbasaur-silhouette.png' },
        { id: '4', name: 'Squirtle', silhouette: 'squirtle-silhouette.png' },
        { id: '5', name: 'Jigglypuff', silhouette: 'jigglypuff-silhouette.png' }
      ];
      component.pokemonList = pokemonList;
      
      component.loadNewPokemon();
      
      expect(component.displayedPokemonList.length).toBe(4);
      expect(component.currentPokemon).toBeTruthy();
      //expect(component.pokemonImageSource).toBe(currentPokemon.silhouette);
      expect(component.answerDisabled).toBeFalse();
      expect(component.nextButtonDisabled).toBeTrue();
    });

    it('should handle errors in loadNewPokemon', () => {
      spyOn(component, 'shuffleArray').and.callFake(() => { throw new Error('Shuffle error'); });
      component.pokemonList = [
        { id: '1', name: 'Pikachu', silhouette: 'pikachu-silhouette.png' }
      ];
      spyOn(console, 'error');
      
      component.loadNewPokemon();
      
      expect(console.error).toHaveBeenCalledWith('Not enough Pokémon to display.');
    });
  });

  describe('shuffleArray', () => {
    it('should shuffle the array', () => {
      const array = [1, 2, 3, 4, 5];
      
      component.shuffleArray(array);
      
      expect(array.length).toBe(5);
      // Check if array is shuffled by verifying if the array has changed
      expect(array).not.toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('populatePokemonList', () => {
    it('should populate the Pokémon list and load new Pokémon', async () => {
      const mockPokemonList: Pokemon[] = [
        { id: '1', name: 'Pikachu', silhouette: 'pikachu-silhouette.png' },
        { id: '2', name: 'Charmander', silhouette: 'charmander-silhouette.png' }
      ];
      spyOn(window, 'fetch').and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPokemonList)
      } as Response));
      spyOn(component, 'loadNewPokemon');
      
      await component.populatePokemonList();
      
      expect(component.pokemonList).toEqual(mockPokemonList);
      expect(component.loadNewPokemon).toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      spyOn(window, 'fetch').and.returnValue(Promise.reject('Fetch error'));
      spyOn(console, 'error');
      
      await component.populatePokemonList();
      
      expect(console.error).toHaveBeenCalledWith('There was a problem with the fetch operation:', 'Fetch error');
    });
  });
});
