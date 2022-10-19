import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Image, FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons";

import logoImg from "../../assets/logo-nlw-esports.png";
import { GameParams } from "../../@types/navigation";
import { Background } from "../../components/Background";

import { styles } from "./styles";
import { THEME } from "../../theme";
import { Heading } from "../../components/Heading";
import { DuoCard, DuoCardProps } from "../../components/DuoCard";
import { DuoMatch } from "../../components/DuoMatch";

export function Game() {
  const route = useRoute();
  const navigation = useNavigation();

  const [duos, setDuos] = useState<DuoCardProps[]>([]);
  const [discordDueSelected, setDiscordDueSelected] = useState("");

  const game = route.params as GameParams;

  async function getDiscordUser(adsId: string) {
    fetch(`http://192.168.15.92:3333/ads/${adsId}/discord`)
      .then((response) => response.json())
      .then((data) => setDiscordDueSelected(data.discord));
  }

  useEffect(() => {
    fetch(`http://192.168.15.92:3333/games/${game.id}/ads`)
      .then((response) => response.json())
      .then((data) => setDuos(data));
  }, []);

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo
              name="chevron-thin-left"
              color={THEME.COLORS.CAPTION_300}
              size={20}
            />
          </TouchableOpacity>
          <Image style={styles.logo} source={logoImg} />
          <View style={styles.right} />
        </View>

        <Image
          style={styles.cover}
          source={{ uri: game.bannerUrl }}
          resizeMode="cover"
        />
        <Heading title={game.title} subtitle="Conecte-se e comece a jogar" />

        <FlatList
          data={duos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DuoCard data={item} onConnect={() => getDiscordUser(item.id)} />
          )}
          style={styles.containerList}
          contentContainerStyle={[
            duos.length > 0 ? styles.contentList : styles.emptyContainer,
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={styles.emptyListText}>
              Não há anúncios publicados ainda.
            </Text>
          )}
        />
        <DuoMatch
          onClose={() => setDiscordDueSelected("")}
          visible={discordDueSelected.length > 0}
          discord={discordDueSelected}
        />
      </SafeAreaView>
    </Background>
  );
}
