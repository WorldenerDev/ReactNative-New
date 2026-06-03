import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import navigationStrings from "@navigation/navigationStrings";
import { useEffect } from "react";

/** @deprecated Use {@link AddCard} — kept for deep links / legacy routes. */
const SaveCard = ({ navigation }) => {
  useEffect(() => {
    navigation.replace(navigationStrings.ADD_CARD);
  }, [navigation]);

  return (
    <MainContainer>
      <Header title="Add Credit Card" />
    </MainContainer>
  );
};

export default SaveCard;
