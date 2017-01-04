class ServiceEndPointController < SDN

  get '/' do
    content_type :json

    top = []

    JSON.parse($redis.get(%Q(#{$redis.get("root-topolopy")}.serviceEndPoint))).each do |sep|
      name = sep["name"][0]["value"]
      typo, node, type = name.split('_').map { |pair|
        pair.partition('/').first
      }
      top << [typo, node, type, name]
    end

    @topos = JSON.parse("[]")
    top.each do |t|
      topo = @topos.detect {|e| e['name'] == t[0] }
      @topos << {"name" => t[0], "children" => []} unless topo

      node = @topos.last['children'].detect {|e| e['name'] == t[1]}
      @topos.last['children'] << {"name"=>t[1], "children"=>[]} unless node

      type = @topos.last['children'].last['children'].detect {|e| e['name'] == t[2]}
      @topos.last['children'].last['children'] << {"name"=>t[2], "children"=>["name"=>t[3]]} unless type

      name = @topos.last['children'].last['children'].last['children'].detect {|e| e['name'] == t[3]}
      @topos.last['children'].last['children'].last['children'] << {"name"=>t[3]} unless name
    end

    @topos.to_json
  end
end
