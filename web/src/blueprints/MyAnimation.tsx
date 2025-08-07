let colors = ["blue", "green", "red"];

export const MyAnime = () => (
  <>
    {colors.map((color, i) => (
      <div key={i} style={{ color: color }}>
        Hello
      </div>
    ))}
  </>
);
