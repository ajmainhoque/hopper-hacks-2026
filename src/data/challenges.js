export const challenges = [
  {
    id: 1,
    spell: "Wingardium Leviosa",
    house: "Gryffindor",
    houseColor: "#740001",
    houseEmoji: "🦁",
    points: 10,
    difficulty: "First Year",
    description:
      "Professor Flitwick needs your help! Cast Wingardium Leviosa by reversing the given string. Remember: it's Levi-O-sa, not Levio-SA! The spell only works if the letters are flipped around.",
    functionName: "wingardiumLeviosa",
    starterCode: `function wingardiumLeviosa(spell) {
  // Reverse the spell string and return it
  // Example: "levioso" → "osoivel"

}`,
    tests: [
      {
        input: ["levioso"],
        expected: "osoivel",
        description: 'wingardiumLeviosa("levioso") → "osoivel"',
      },
      {
        input: ["magic"],
        expected: "cigam",
        description: 'wingardiumLeviosa("magic") → "cigam"',
      },
      {
        input: ["hogwarts"],
        expected: "strawgoh",
        description: 'wingardiumLeviosa("hogwarts") → "strawgoh"',
      },
    ],
    hint: "Try using .split('').reverse().join('')",
    successQuote: "Excellent work! Even Hermione would be proud!",
  },
  {
    id: 2,
    spell: "The Sorting Hat",
    house: "Hufflepuff",
    houseColor: "#ecb939",
    houseEmoji: "🦡",
    points: 20,
    difficulty: "Second Year",
    description:
      "The Sorting Hat has mixed up all the Hogwarts students! Help sort them into the correct order alphabetically. Return the array of student names sorted from A to Z.",
    functionName: "sortingHat",
    starterCode: `function sortingHat(students) {
  // Sort the students array alphabetically (A to Z) and return it
  // Example: ["Ron", "Harry", "Hermione"] → ["Harry", "Hermione", "Ron"]

}`,
    tests: [
      {
        input: [["Ron", "Harry", "Hermione"]],
        expected: ["Harry", "Hermione", "Ron"],
        description:
          'sortingHat(["Ron", "Harry", "Hermione"]) → ["Harry", "Hermione", "Ron"]',
      },
      {
        input: [["Neville", "Draco", "Luna"]],
        expected: ["Draco", "Luna", "Neville"],
        description:
          'sortingHat(["Neville", "Draco", "Luna"]) → ["Draco", "Luna", "Neville"]',
      },
      {
        input: [["Voldemort", "Dumbledore", "Snape"]],
        expected: ["Dumbledore", "Snape", "Voldemort"],
        description:
          'sortingHat(["Voldemort", "Dumbledore", "Snape"]) → ["Dumbledore", "Snape", "Voldemort"]',
      },
    ],
    hint: "Try using .sort() — but careful, it sorts in place! Return a copy if you want.",
    successQuote:
      "HUFFLEPUFF! You have a good heart and great sorting skills!",
  },
  {
    id: 3,
    spell: "Lumos Maxima",
    house: "Ravenclaw",
    houseColor: "#0e1a40",
    houseEmoji: "🦅",
    points: 30,
    difficulty: "Third Year",
    description:
      "Dark creatures are lurking! Cast Lumos Maxima by finding the brightest (maximum) light — the largest number in the array. Return the maximum value to banish the darkness!",
    functionName: "lumosMaxima",
    starterCode: `function lumosMaxima(numbers) {
  // Find and return the largest number in the array
  // Example: [3, 1, 9, 4, 7] → 9

}`,
    tests: [
      {
        input: [[3, 1, 9, 4, 7]],
        expected: 9,
        description: "lumosMaxima([3, 1, 9, 4, 7]) → 9",
      },
      {
        input: [[42, 17, 8, 99, 55]],
        expected: 99,
        description: "lumosMaxima([42, 17, 8, 99, 55]) → 99",
      },
      {
        input: [[-5, -3, -10, -1]],
        expected: -1,
        description: "lumosMaxima([-5, -3, -10, -1]) → -1",
      },
    ],
    hint: "Try Math.max(...numbers) or use reduce().",
    successQuote: "RAVENCLAW! Your wit and intellect shine brightest of all!",
  },
  {
    id: 4,
    spell: "Accio",
    house: "Slytherin",
    houseColor: "#1a472a",
    houseEmoji: "🐍",
    points: 40,
    difficulty: "Fourth Year",
    description:
      "The Golden Snitch has been hidden among odd-numbered bludgers! Cast Accio to retrieve the first even number from the array. Return the first even number found, or null if none exist.",
    functionName: "accio",
    starterCode: `function accio(numbers) {
  // Find and return the first even number in the array
  // Return null if no even numbers exist
  // Example: [1, 3, 4, 6, 7] → 4

}`,
    tests: [
      {
        input: [[1, 3, 4, 6, 7]],
        expected: 4,
        description: "accio([1, 3, 4, 6, 7]) → 4",
      },
      {
        input: [[2, 5, 9, 11]],
        expected: 2,
        description: "accio([2, 5, 9, 11]) → 2",
      },
      {
        input: [[1, 3, 5, 7]],
        expected: null,
        description: "accio([1, 3, 5, 7]) → null",
      },
    ],
    hint: "Try using .find() with a condition that checks n % 2 === 0.",
    successQuote:
      "SLYTHERIN! Cunning and resourceful — you found exactly what you needed!",
  },
  {
    id: 5,
    spell: "Expecto Patronum",
    house: "All Houses",
    houseColor: "#c0c0c0",
    houseEmoji: "✨",
    points: 50,
    difficulty: "Fifth Year",
    description:
      "A Patronus is a reflection of your true self — it reads the same forwards and backwards! Check if the given word is a palindrome (reads the same in both directions). Return true if it is, false if it isn't.",
    functionName: "expectoPatronum",
    starterCode: `function expectoPatronum(word) {
  // Return true if word is a palindrome, false otherwise
  // A palindrome reads the same forwards and backwards
  // Example: "racecar" → true, "harry" → false

}`,
    tests: [
      {
        input: ["racecar"],
        expected: true,
        description: 'expectoPatronum("racecar") → true',
      },
      {
        input: ["harry"],
        expected: false,
        description: 'expectoPatronum("harry") → false',
      },
      {
        input: ["level"],
        expected: true,
        description: 'expectoPatronum("level") → true',
      },
      {
        input: ["magic"],
        expected: false,
        description: 'expectoPatronum("magic") → false',
      },
    ],
    hint: 'Reverse the word and compare it to the original: word === word.split("").reverse().join("")',
    successQuote:
      "EXPECTO PATRONUM! A magnificent stag! You have mastered the final spell!",
  },
];
