import React, { useCallback, useState } from "react";
import { StyleSheet, FlatList, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import InspirationCard from "@components/home/InspirationCard";
import { getInspiration } from "@api/services/mainServices";
import { useStickyScrollPadding } from "@hooks/useStickyBottomInset";
import { getVertiPadding } from "@utils/responsive";
import { openInspirationTarget } from "@utils/homeHelpers";

const InspirationList = ({ navigation }) => {
  const scrollPadding = useStickyScrollPadding();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await getInspiration();
      const list = response?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <MainContainer loader={loading}>
      <Header title="Get inspired" showBack />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id || item._id)}
        renderItem={({ item }) => (
          <InspirationCard
            item={item}
            onPress={() => openInspirationTarget(navigation, item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: scrollPadding },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </MainContainer>
  );
};

export default InspirationList;

const styles = StyleSheet.create({
  list: {
    paddingTop: getVertiPadding(8),
  },
  separator: {
    height: getVertiPadding(14),
  },
});
