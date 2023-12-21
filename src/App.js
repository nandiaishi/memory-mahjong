import { useEffect, useState } from "react";
import "./App.css";
import {
  Box,
  Dialog,
  DialogContent,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import {
  WatchLater,
  WatchLaterTwoTone,
  WatchLaterOutlined,
} from "@mui/icons-material";

const numberOfCardsOnBoard = 24;

const cardValues = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const cardSuits = ["S", "H", "C", "D"];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const pickUniqueSets = (array1, array2, n) => {
  const shuffledArray1 = shuffleArray([...array1]);
  const shuffledArray2 = shuffleArray([...array2]);

  const uniqueSets = [];

  while (uniqueSets.length < n) {
    const randomIndex1 = Math.floor(Math.random() * shuffledArray1.length);
    const randomIndex2 = Math.floor(Math.random() * shuffledArray2.length);

    const item1 = shuffledArray1[randomIndex1];
    const item2 = shuffledArray2[randomIndex2];

    const currentSet = `${item1}${item2}`;

    if (!uniqueSets.includes(currentSet)) {
      uniqueSets.push(currentSet);
    }
  }

  return uniqueSets;
};

const preloadImages = async (imageNames) => {
  const imagePromises = imageNames.map(async (name) => {
    const url = `/cards/${name}.svg`;
    const response = await fetch(url);
    const blob = await response.blob();
    return { [name]: blob };
  });

  try {
    const imageBlobs = await Promise.all(imagePromises);
    return Object.assign({}, ...imageBlobs);
  } catch (error) {
    console.error("Error preloading images:", error);
    return {};
  }
};

const statusValues = {
  NOT_STARTED: "NOT_STARTED",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
};

function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [secondLastClickedcard, setSecondLastClickedCard] = useState({});
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(true);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [timePassed, setTimePassed] = useState(0);
  const [status, setStatus] = useState(statusValues.NOT_STARTED);
  const [cards, setCards] = useState({});

  const tableBackground = "/assets/table.webp";
  const tableBorderBackground = "/assets/table-border.jpeg";

  const pickRandomCardsets = () => {
    let randomCards = pickUniqueSets(
      cardValues,
      cardSuits,
      numberOfCardsOnBoard / 2
    );
    preloadImages(randomCards).then((cachedCards) => {
      setCards(cachedCards);
    });
    let doubledCards = [...randomCards, ...randomCards];
    let shuffledCards = shuffleArray(doubledCards);
    const cardsArray = shuffledCards.map((item, index) => {
      return {
        revealed: false,
        solved: false,
        value: item,
      };
    });

    setSelectedCards(cardsArray);
  };

  const playSound = (sound) => {
    const audio = new Audio(`/sound/${sound}.mp3`);
    audio.play();
  };

  useEffect(() => {
    pickRandomCardsets();
  }, []);

  useEffect(() => {
    let intervalId;

    if (status === statusValues.STARTED) {
      intervalId = setInterval(() => {
        setTimePassed((prevTime) => {
          return prevTime + 1;
        });
      }, 1000);
    }

    // Clear the interval when the game is finished
    if (status === statusValues.FINISHED) {
      clearInterval(intervalId);
    }

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [status]);

  useEffect(() => {
    if (selectedCards.length > 0) {
      let solved = true;
      selectedCards.forEach((item) => {
        if (!item.solved) solved = false;
      });
      if (solved) {
        setTimeout(() => {
          setStatus(statusValues.FINISHED);
          setFinishModalOpen(true);
          playSound("finish");
        }, 600);
      }
    }
  }, [selectedCards]);

  const onCardClick = (item, index) => {
    if (!item.revealed && !item.solved) {
      const revealedArray = selectedCards.map((card, cardIndex) => {
        if (index === cardIndex) {
          return {
            ...card,
            revealed: true,
          };
        } else {
          return {
            ...card,
            revealed: false,
          };
        }
      });
      setSelectedCards(revealedArray);

      if (secondLastClickedcard.value === item.value) {
        const solvedArray = selectedCards.map((card) => {
          if (card.value === item.value) {
            return {
              ...card,
              solved: true,
            };
          } else {
            return card;
          }
        });
        setSelectedCards(solvedArray);
        setSecondLastClickedCard({});
        playSound("solve");
      } else {
        setSecondLastClickedCard(item);
        playSound("click");
      }
    }
  };

  const start = () => {
    setWelcomeModalOpen(false);
    setStatus(statusValues.STARTED);
  };

  const restart = () => {
    setFinishModalOpen(false);
    setTimePassed(0);
    setStatus(statusValues.STARTED);
    pickRandomCardsets();
  };

  const getTitle = () => {
    const firstTier = ["Velocity Vanguard", "Master of Time", "Speed Demon"];
    const secondTier = ["Chrono Commander", "Timekeeper", "Swift Finisher"];
    const thirdTier = ["Time Traveler", "Chronicle Novice", "Steady Player"];

    if (timePassed <= numberOfCardsOnBoard * 3) {
      return shuffleArray(firstTier)[0];
    } else if (timePassed <= numberOfCardsOnBoard * 5) {
      return shuffleArray(secondTier)[0];
    } else {
      return shuffleArray(thirdTier)[0];
    }
  };

  return (
    <Box
      sx={(theme) => ({
        background: `url(${"https://i.pinimg.com/736x/2c/67/fb/2c67fb43d38ebe75ef01fd0a3367ba46.jpg"}) repeat`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      })}
    >
      <Box
        sx={{
          background: ` url(${tableBorderBackground})`,
          padding: "24px",
          borderRadius: 20,
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            position: "absolute",
            color: "white",
            background: ` url(${tableBorderBackground})`,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundSize: "cover",
            left: "50%",
            top: -50,
            px: 2,
            transform: "translate(-50%)",
          }}
        >
          <Typography
            variant="button"
            align="center"
            sx={{
              fontSize: 42,
              fontWeight: 900,
              px: 2,
              color: "#f2cb9a",
              fontFamily: "Chingchong ",
            }}
          >
            Memory Mahjong
          </Typography>
        </Box>
        <Box
          sx={{
            textAlign: "center",
            position: "absolute",
            color: "#f2cb9a",
            left: "50%",
            transform: "translate(-50%)",
            top: 28,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {timePassed <= numberOfCardsOnBoard * 3 ? (
            <WatchLater fontSize="small" />
          ) : timePassed <= numberOfCardsOnBoard * 5 ? (
            <WatchLaterTwoTone fontSize="small" />
          ) : (
            <WatchLaterOutlined fontSize="small" />
          )}
          <Typography variant="subtitle1" component="h6">
            {timePassed} seconds
          </Typography>
        </Box>
        <Box
          sx={{
            boxSizing: "border-box",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2,
            p: 8,
            borderRadius: 16,
            maxWidth: 1200,
            background: ` url(${tableBackground}) repeat`,
          }}
        >
          {selectedCards.map((item, index) => {
            return (
              <Paper
                elevation={5}
                onClick={() => onCardClick(item, index)}
                className={`flip-container ${
                  item.solved || item.revealed ? "flipped" : ""
                }`}
                key={index}
                sx={{
                  borderRadius: 2,
                  width: 108,
                  height: 150,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    boxShadow:
                      "0px 3px 8px -1px rgba(0,0,0,0.2), 0px 5px 12px 0px rgba(0,0,0,0.14), 0px 1px 20px 0px rgba(0,0,0,0.12)",
                    transform:
                      !item.revealed && !item.solved ? "scale(1.08)" : null,
                  },
                }}
              >
                <Box
                  // src={`./cards/${
                  //   !item.revealed && !item.solved ? "RED_BACK" : item.value
                  // }.svg`}
                  src={
                    !item.revealed && !item.solved
                      ? "/cards/RED_BACK.svg"
                      : URL.createObjectURL(cards[item.value]) ??
                        `/cards/${item.value}.svg`
                  }
                  alt="card"
                  component="img"
                  style={{
                    maxWidth: "100%",
                    transform: "rotateY(180deg)",
                  }}
                />
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Dialog open={welcomeModalOpen}>
        <DialogContent>
          <Typography variant="h5" color="dodgerblue" align="center">
            <b>Welcome to Memory Mahjong!</b>
          </Typography>
          <Typography variant="h6" mt={1}>
            Objective:
          </Typography>
          <Typography variant="body1">
            Uncover all pairs of cards in the shortest possible time.
          </Typography>
          <Typography variant="h6" mt={1}>
            How to play:
          </Typography>
          <Typography variant="body1">
            1. Click each card to reveal its value.
          </Typography>
          <Typography variant="body1">
            2. Match identical cards to keep them face up.
          </Typography>
          <Typography variant="body1">
            3. If the cards{" "}
            <span style={{ fontWeight: "bold" }}>don't match</span>, they go
            back face down.
          </Typography>
          <Typography variant="body1">4. Find all pairs to win!</Typography>
          <Typography variant="subtitle2" align="center" mt={3} color={""}>
            <b>Enjoy the challenge of Memory Mahjong!</b>
            <br />
            <br />
            <Button variant="contained" onClick={start}>
              Let's go!
            </Button>
          </Typography>
        </DialogContent>
      </Dialog>
      <Dialog
        open={finishModalOpen}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: 4,
          },
        }}
      >
        <DialogContent>
          <Box
            component="img"
            sx={{
              width: 80,
              mx: "auto",
              display: "block",
            }}
            src={"./assets/confetti.gif"}
          />
          <Typography variant="h5" color="green" align="center" my={2}>
            <b>Congratulations</b>
          </Typography>
          <Typography variant="body1">
            You've won the title of{" "}
            <b style={{ color: "#3098fc" }}>{getTitle()}</b> for solving it in{" "}
            {timePassed} seconds
          </Typography>
          <Button
            variant="contained"
            onClick={restart}
            sx={{
              mx: "auto",
              display: "block",
              mt: 3,
            }}
          >
            Restart
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default App;
